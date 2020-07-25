'use strict';

/* Magic Mirror
* Module: MMM-AmbientBrightnessDetection
*
* By Eric H.
* MIT Licensed.
*/

const NodeHelper = require('node_helper');
const NodeWebcam = require( 'node-webcam');
var self = null;

module.exports = NodeHelper.create({
	camera: null,
	opts: null,
	snapshotInterval: null,

	log: function(message) {
		console.log(this.name + ":" + message);
	},

	start: function() {
		this.log("Starting");
		this.started = false;
		self = this;
	},

	socketNotificationReceived: function (notification, payload) {
		switch (notification) {
			case "CONFIG":
				if (!this.started) {
					this.config = payload;
					this.prepare();
					this.started = true;
					this.log("Started.");
					if (this.config.captureIntervalSeconds > 0) {
						this.log("Setting interval to: " + this.config.captureIntervalSeconds * 1000);
						this.snapshotInterval = setInterval(this.snapshot, this.config.captureIntervalSeconds * 1000);
					}
					this.snapshot();
				}
				break;
			case "STOP": {
				clearInterval(this.snapshotInterval);
				break;
			}
			default: ;
		}
	},

	prepare: function() {
                this.opts = {
                        width: this.config.captureWidth,
                        height: this.config.captureHeight,
                        quality: 100,
                        frames: 1,
                        delay: 0,
                        saveShots: false,
                        output: "jpeg",
                        device: false,
						callbackReturn: "base64",
                        verbose:false
                };

                this.camera = NodeWebcam.create( this.opts );
	},

	snapshot: function() {
		self.log("Capturing: " + self.name + ".jpg");

        self.camera.capture(self.name, (err, data) => {
			if (!err) {
				self.sendSocketNotification("DATA", data);
			}
			else {
				self.log(err);
			}
		});
	},

	notify: function(err, data) {
		if (!err) {
			self.sendSocketNotification("DATA", data);
		}
		else {
			self.log(err);
		}
	}
});
