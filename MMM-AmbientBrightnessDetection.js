/* Magic Mirror
* Module: MMM-AmbientBrightnessDetection
*
* By Eric H.
* MIT Licensed.
*/

Module.register('MMM-AmbientBrightnessDetection',{
	defaults: {
		device: null,
		captureWidth: 640,
		captureHeight: 480,
		captureIntervalSeconds: 60,
		autoSetBrightnessViaRemoteControl: true,
		autoBrightnessLowerFactorViaRemoteControl: null,
		autoBrightnessMinValueViaRemoteControl: 30,
		autoBrightnessMaxValueViaRemoteControl: null,
		animateBrightnessChange: true		
  	},
	imageWrapper : null,
	canvasWrapper: null,
	htmlElementWrapper: null,
	brightnessLevelWrapper: null,
	ctx: null,
	brightness: 100,

	getStyles: function() {
		return [
			"MMM-AmbientBrightnessDetection.css"
		];
	},

	getDom: function() {
		this.htmlElementWrapper = document.createElement("div");
		this.htmlElementWrapper.className = "detectedBrightness";

		this.brightnessLevelWrapper = document.createElement("div");
		this.brightnessLevelWrapper.className = "detectedBrightnessGauge";
		this.brightnessLevelWrapper.addEventListener("animationend", this.displayNewBrightness.bind(this));

		var lWrapper = document.createElement("i");
		lWrapper.className = "fa fa-lightbulb-o detectedBrightnessIcon";
		this.htmlElementWrapper.appendChild(lWrapper);

		this.brightnessLevelWrapper.style.width = this.brightness + "%";
		this.htmlElementWrapper.appendChild(this.brightnessLevelWrapper);

		return this.htmlElementWrapper;
	},

  	// Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
		switch (notification) {
			case "DATA":
				this.imageWrapper.src = payload;
			break;
			case "DATA_FILENAME":
				this.imageWrapper.src = this.file(payload);
			default: 
			break;
		}		
	},

	notificationReceived: function (notification, payload) {
	},

	calculateBrightness: function(e) {
		this.ctx.drawImage(this.imageWrapper, 0, 0);
		var imageData = this.ctx.getImageData(0, 0, this.canvasWrapper.width, this.canvasWrapper.height);
		var data = imageData.data;
		var i, len, r,g,b, colorSum = 0;

		for (i = 0, len = data.length; i < len; i += 4) {
			r = data[i];
			g = data[i + 1];
			b = data[i + 2];

			colorSum += (r + g + b) / 3;
		}
		
		var oldBrightness = this.brightness;
		this.brightness = Math.floor(colorSum / (this.canvasWrapper.width * this.canvasWrapper.height) / 256 * 100);
		if (oldBrightness != this.brightness) {
			Log.info("Brightness detected at: " + this.brightness + "%");

			this.sendNotification("AMBIENT_BRIGHTNESS_DETECTED", this.brightness);		

			if (this.htmlElementWrapper) {
				this.htmlElementWrapper.style.visibility = "visible";
				if (this.config.animateBrightnessChange) {
					this.brightnessLevelWrapper.style.setProperty("--from", oldBrightness + "%");
					this.brightnessLevelWrapper.style.setProperty("--to", this.brightness + "%");

					this.brightnessLevelWrapper.classList.add('brightnessChangeAnimation');
				}
				else {
					this.displayNewBrightness();
				}
			}
			else {
				this.notifyRemoteControl();
			}
		}
	},

	notifyRemoteControl: function() {
		if (this.config.autoSetBrightnessViaRemoteControl) {
			var autoBrightnessViaRemoteControl = this.brightness * 190 / 100;
			if (this.config.autoBrightnessFactorViaRemoteControl && this.config.autoBrightnessFactorViaRemoteControl > 0 && this.config.autoBrightnessFactorViaRemoteControl <= 100) {
				if (autoBrightnessViaRemoteControl < 40)
					autoBrightnessViaRemoteControl = autoBrightnessViaRemoteControl + autoBrightnessViaRemoteControl * this.config.autoBrightnessFactorViaRemoteControl / 100;
				else if (autoBrightnessViaRemoteControl > 160)
					autoBrightnessViaRemoteControl = autoBrightnessViaRemoteControl - (190-autoBrightnessViaRemoteControl) * this.config.autoBrightnessFactorViaRemoteControl / 100;
			}
			if (this.config.autoBrightnessMinValueViaRemoteControl)
				autoBrightnessViaRemoteControl = Math.max(this.config.autoBrightnessMinValueViaRemoteControl, autoBrightnessViaRemoteControl);
			if (this.config.autoBrightnessMaxValueViaRemoteControl)
				autoBrightnessViaRemoteControl = Math.min(this.config.autoBrightnessMaxValueViaRemoteControl, autoBrightnessViaRemoteControl);

			this.sendNotification("REMOTE_ACTION", {action: 'BRIGHTNESS', value: 10 + autoBrightnessViaRemoteControl });
		}
	},

	displayNewBrightness: function() {
		this.brightnessLevelWrapper.style.width = this.brightness + "%";
		this.updateDom(10000);
		this.notifyRemoteControl();
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		if (this.config.autoBrightnessMinValueViaRemoteControl && this.config.autoBrightnessMaxValueViaRemoteControl && this.config.autoBrightnessMinValueViaRemoteControl > this.config.autoBrightnessMaxValueViaRemoteControl)
			this.config.autoBrightnessMinValueViaRemoteControl = this.config.autoBrightnessMaxValueViaRemoteControl = null;

		if (this.config.autoBrightnessMinValueViaRemoteControl && this.config.autoBrightnessMinValueViaRemoteControl < 10)
			this.config.autoBrightnessMinValueViaRemoteControl = null;

		if (this.config.autoBrightnessMaxValueViaRemoteControl && this.config.autoBrightnessMaxValueViaRemoteControl > 200)
			this.config.autoBrightnessMaxValueViaRemoteControl = null;

		this.imageWrapper = document.createElement("img");
		this.canvasWrapper = document.createElement("canvas");

		this.imageWrapper.style.display = "none";

		this.canvasWrapper.width = this.config.captureWidth;
		this.canvasWrapper.height = this.config.captureHeight;

		this.ctx = this.canvasWrapper.getContext('2d');

		this.imageWrapper.addEventListener('load', this.calculateBrightness.bind(this));

		this.sendSocketNotification('CONFIG', this.config);
	},

	suspend: function() {
		this.sendSocketNotification('SUSPEND', this.config);
	},

	resume: function() {
		this.sendSocketNotification('RESUME', this.config);
	}
});
