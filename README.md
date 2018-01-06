# homebridge-thingspeak
Homebridge platform that supports Thingspeak's last entry value.

## Installation

1. Install homebridge using: sudo npm install -g homebridge
2. Install this plugin using: sudo npm install -g homebridge-thingspeak
3. Update your configuration file. See sample-config.json in this repository for a sample.
4. Start Homebridge: homebridge

## Configuration

    {
    "accessory": "Httpthingspeak",
    "name": "Temperature",
    "type": "CurrentTemperature",
    "manufacturer" : "SensorManu 1",
    "model": "SensorModel 1",
    "serial": "SensorSerial 1",
    "url": "https://api.thingspeak.com/channels/num_of_channel/field/1/last.json",
    "http_method": "GET",
    "debug": true
    }
               
## The Thingspeak url should return a json string looks like this:

    {"created_at":"2017-12-23T16:30:53Z","entry_id":16113,"field1":"7.2"}

Please see sample-config.json for configuration options.

This plugin acts as an interface between Thingspeak and Homebridge.

