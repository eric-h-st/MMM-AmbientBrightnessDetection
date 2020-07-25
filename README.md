# MMM-AmbientBrightnessDetection
Extension for the [MagicMirror](https://github.com/MichMich/MagicMirror). 
Monitors the room's ambient brightness by sampling images from the attached Webcam and calculating the brightness in the image. 
As of now, this has been tested with a Logitech webcam, but should work with any PI compatibale webcam.

Up next: support the PI-Camera module. 

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
			<td><code>autoSetBrightnessViaRemoteControl</code></td>
      <td>Should <b>MMM-RemoteControl</b> be notified with a <i>REMOTE_ACTION</i> to set the brightness according to the ambient light in the room?<br>
				<br><b>Possible values:</b> <code>boolean</code>
				<br><b>Default value:</b> <code>true</code>
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
