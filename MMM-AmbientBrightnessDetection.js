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
		autoBrightnessMaxValueViaRemoteControl: null
  	},
	imageWrapper : null,
	canvasWrapper: null,
	ctx: null,
	brightness: -1,

  	// Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
		if (notification === "DATA") {
			this.imageWrapper.src = payload;
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
		self.brightness = Math.floor(colorSum / (self.canvasWrapper.width * self.canvasWrapper.height) / 256 * 100);
		Log.info("Brightness detected at: " + self.brightness + "%");

		self.sendNotification("AMBIENT_BRIGHTNESS_DETECTED", self.brightness);

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

	stop: function() {
		this.sendSocketNotification('STOP', this.config);
	}
});
