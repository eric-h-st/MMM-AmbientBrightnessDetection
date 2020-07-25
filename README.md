# MMM-AmbientBrightnessDetection
Extension for the [MagicMirror](https://github.com/MichMich/MagicMirror). 
Monitors the room's ambient brightness by sampling images from the attached Webcam and calculating the brightness in the image. 

## Installation
````
cd ~/MagicMirror
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

## Dependencies
- [node-webcam](https://www.npmjs.com/package/node-webcam) (installed via `npm install`)
- MMM-RemoteControl (optional) for auto-brightness 

## The MIT License (MIT)
