/* Magic Mirror
* Module: MMM-AmbientLights
*
* By Eric H. 
* MIT Licensed.
*/

Module.register('MMM-AmbientLights',{
	defaults: {
  },
  
  // Override socket notification handler.
	socketNotificationReceived: function (notification, payload) {
	},

	notificationReceived: function (notification, payload) {
	},

	start: function () {
		this.sendSocketNotification('CONFIG', this.config);
		Log.info('Starting module: ' + this.name);
	}
});
