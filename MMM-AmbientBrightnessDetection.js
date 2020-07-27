/* Magic Mirror
* Module: MMM-AmbientBrightnessDetection
*
* By Eric H.
* MIT Licensed.
*/

var self = null;
Module.register('MMM-AmbientBrightnessDetection',{
	defaults: {
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
		this.brightnessLevelWrapper.addEventListener("animationend", this.displayNewBrightness);

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
		self.ctx.drawImage(self.imageWrapper, 0, 0);
		var imageData = self.ctx.getImageData(0, 0, self.canvasWrapper.width, self.canvasWrapper.height);
		var data = imageData.data;
		var i, len, r,g,b, colorSum = 0;

		for (i = 0, len = data.length; i < len; i += 4) {
			r = data[i];
			g = data[i + 1];
			b = data[i + 2];

			colorSum += (r + g + b) / 3;
		}
		
		var oldBrightness = self.brightness;
		self.brightness = Math.floor(colorSum / (self.canvasWrapper.width * self.canvasWrapper.height) / 256 * 100);
		if (oldBrightness != self.brightness) {
			Log.info("Brightness detected at: " + self.brightness + "%");

			self.sendNotification("AMBIENT_BRIGHTNESS_DETECTED", self.brightness);		

			if (self.htmlElementWrapper) {
				self.htmlElementWrapper.style.visibility = "visible";
				if (self.config.animateBrightnessChange) {
					self.brightnessLevelWrapper.style.setProperty("--from", oldBrightness + "%");
					self.brightnessLevelWrapper.style.setProperty("--to", self.brightness + "%");

					self.brightnessLevelWrapper.classList.add('brightnessChangeAnimation');
				}
				else {
					self.displayNewBrightness();
				}
			}
			else {
				self.notifyRemoteControl();
			}
		}
	},

	notifyRemoteControl: function() {
		if (self.config.autoSetBrightnessViaRemoteControl) {
			var autoBrightnessViaRemoteControl = self.brightness * 190 / 100;
			if (self.config.autoBrightnessFactorViaRemoteControl && self.config.autoBrightnessFactorViaRemoteControl > 0 && self.config.autoBrightnessFactorViaRemoteControl <= 100) {
				if (autoBrightnessViaRemoteControl < 40)
					autoBrightnessViaRemoteControl = autoBrightnessViaRemoteControl + autoBrightnessViaRemoteControl * self.config.autoBrightnessFactorViaRemoteControl / 100;
				else if (autoBrightnessViaRemoteControl > 160)
					autoBrightnessViaRemoteControl = autoBrightnessViaRemoteControl - (190-autoBrightnessViaRemoteControl) * self.config.autoBrightnessFactorViaRemoteControl / 100;
			}
			if (self.config.autoBrightnessMinValueViaRemoteControl)
				autoBrightnessViaRemoteControl = Math.max(self.config.autoBrightnessMinValueViaRemoteControl, autoBrightnessViaRemoteControl);
			if (self.config.autoBrightnessMaxValueViaRemoteControl)
				autoBrightnessViaRemoteControl = Math.min(self.config.autoBrightnessMaxValueViaRemoteControl, autoBrightnessViaRemoteControl);

			self.sendNotification("REMOTE_ACTION", {action: 'BRIGHTNESS', value: 10 + autoBrightnessViaRemoteControl });
		}
	},

	displayNewBrightness: function() {
		self.brightnessLevelWrapper.style.width = self.brightness + "%";
		self.updateDom(10000);
		self.notifyRemoteControl();
	},

	start: function () {
		Log.info("Starting module: " + this.name);
		self = this;
		if (self.config.autoBrightnessMinValueViaRemoteControl && self.config.autoBrightnessMaxValueViaRemoteControl && self.config.autoBrightnessMinValueViaRemoteControl > self.config.autoBrightnessMaxValueViaRemoteControl)
			self.config.autoBrightnessMinValueViaRemoteControl = self.config.autoBrightnessMaxValueViaRemoteControl = null;

		if (this.config.autoBrightnessMinValueViaRemoteControl && this.config.autoBrightnessMinValueViaRemoteControl < 10)
			this.config.autoBrightnessMinValueViaRemoteControl = null;

		if (this.config.autoBrightnessMaxValueViaRemoteControl && this.config.autoBrightnessMaxValueViaRemoteControl > 200)
			this.config.autoBrightnessMaxValueViaRemoteControl = null;

		this.imageWrapper = document.createElement("img");
		this.canvasWrapper = document.createElement("canvas");

		this.imageWrapper.style.display = "none";

		this.canvasWrapper.width = this.config.captureWidth;
		this.canvasWrapper.height = this.config.captureHeight;

		this.ctx = self.canvasWrapper.getContext('2d');

		this.imageWrapper.addEventListener('load', this.calculateBrightness);

		this.sendSocketNotification('CONFIG', this.config);
	},

	suspend: function() {
		this.sendSocketNotification('SUSPEND', this.config);
	},

	resume: function() {
		this.sendSocketNotification('RESUME', this.config);
	}
});
