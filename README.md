# MMM-AmbientBrightnessDetection
Extension for the [MagicMirror](https://github.com/MichMich/MagicMirror). 
Monitors the room's ambient brightness by sampling images from the attached camera and calculating the brightness in the image. 
Supports automatic brightsness adjutment via <i>MMM-RemoteControl</i>.

**Notes:**
* As of now, this has been tested with a Logitech webcam, but should work with any PI compatibale webcam.
* This module does not have to be visible to operate (send notifications) and update the screen brightness. If visible, will show and optionally animate brightness changes. 

**Next to be added:** 

* CEC support to change the actual brightness of the monitor, if supported.
* PI camera module support

## Screenshots

![](screenshots/screenshot.png)

## Installation
````
cd ~/MagicMirror/modules
git clone https://github.com/eric-h-st/MMM-AmbientBrightnessDetection.git
cd MMM-AmbientBrightnessDetection
npm install
````

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: 'MMM-AmbientBrightnessDetection',
		position: "fullscreen_above", // Optional, but if used- it is recommended to use "fullscreen_above" only
		config: {
			// See 'Configuration options' for more information.
		}
	}
]
````

## Configuration Options

The following properties can be configured:

<table width="100%">
	<!-- why, markdown... -->
	<thead>
		<tr>
			<th>Option</th>
			<th width="100%">Description</th>
		</tr>
	<thead>
	<tbody>
		<tr>
			<td><code>captureWidth</code></td>
			<td>Width, in pixels, of the image to capture in order to calculate the brightness<br>
				<br><b>Possible values:</b> <code>int</code>
				<br><b>Default value:</b> <code>640</code>
        <br><b>Note:</b> The bigger the sample, the longer it would take to calculate. A 640x480 image should be accurate enough. 
			</td>
		</tr>
		<tr>
			<td><code>capturHeight</code></td>
			<td>Height, in pixels, of the image to capture in order to calculate the brightness<br>
				<br><b>Possible values:</b> <code>int</code>
				<br><b>Default value:</b> <code>480</code>
        <br><b>Note:</b> The bigger the sample, the longer it would take to calculate. A 640x480 image should be accurate enough. 
			</td>
		</tr>
		<tr>
			<td><code>captureIntervalSeconds</code></td>
			<td>The frequency of re-capturing and re-calculating the brightness, in seconds<br>
				<br><b>Possible values:</b> <code>int > 0</code>
				<br><b>Default value:</b> <code>60</code>
			</td>
		</tr>
		<tr>
			<td><code>animateBrightnessChange</code></td>
			<td>When visible, should brightness changes be animated?
				<br><b>Possible values:</b> <code>boolean</code>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>	
		<tr>
			<td><code>autoSetBrightnessViaRemoteControl</code></td>
			<td>Should <b>MMM-RemoteControl</b> be notified with a <i>REMOTE_ACTION</i> to set the brightness according to the ambient light in the room?<br>
				<br><b>Possible values:</b> <code>boolean</code>
				<br><b>Default value:</b> <code>true</code>
			</td>
		</tr>
		<tr>
			<td><code>autoBrightnessFactorViaRemoteControl</code></td>
			<td>Factor to add to the edge values when setting the brightness via <b>MMM-RemoteControl</b>
				<br>The factor is added when the calculated automatic brightness is either very high or very low, in order to avoid screen blanking at close-to-dark environments, or screen too bright in very bright environments. 
				<br><b>Possible values:</b> <code>1 >= int <= 100</code> or <code>null</code> for no factor
				<br><b>Default value:</b> <code>null</code>
			</td>
		</tr>
		<tr>
			<td><code>autoBrightnessMinValueViaRemoteControl</code></td>
			<td>Minimum value to for brightness when setting via <b>MMM-RemoteControl</b>
				<br><b>Possible values:</b> <code>10 > int < 200</code> or <code>null</code> for none
				<br><b>Default value:</b> <code>null</code>
			</td>
		</tr>
		<tr>
			<td><code>autoBrightnessMaxValueViaRemoteControl</code></td>
			<td>Maximum value to for brightness when setting via <b>MMM-RemoteControl</b>
				<br><b>Possible values:</b> <code>10 > int < 200</code> or <code>null</code> for none
				<br><b>Default value:</b> <code>30</code>
			</td>
		</tr>
  </tbody>
</table>

## Developer Notes
This module broadcasts a `AMBIENT_BRIGHTNESS_DETECTED` notification with the payload of an integer representing the percentage of ambient light detected. You could use it to perform various actions. 
<br>
<br>
This module also broadcasts a `REMOTE_ACTION` notification (to be used by the <b>MMM-RemoteControl</b> module) with the payload of an integer between 10-200 representing coresponding to the percentage of ambient light detected within the specific range supported by that module. 


## Dependencies
- [node-webcam](https://www.npmjs.com/package/node-webcam) (installed via `npm install`)
- MMM-RemoteControl (optional) for auto-brightness 

## The MIT License (MIT)
