/*
 * Homebridge-Plugin for Thingspeak Temperature and Humidity-Sensors
 * based on HttpMultisensor
 *
 * Sensor Request example URL:
 * https://api.thingspeak.com/channels/num_of_channel/field/1/last.json
 *
 * Sensor returns
 * {"{"created_at":"2017-12-23T16:30:53Z","entry_id":16113,"field1":"7.2"}"}
 *
 * License: MIT
 *
 * (C) tamasharasztosi, 2017
 */

var request = require('request');


module.exports = function (homebridge) {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory(
		"homebridge-thingspeak",  // PluginName
		"Httpthingspeak",      // accessoryName
		Httpthingspeak         // constructor
	);
}


function Httpthingspeak(log, config) {
	this.log = log;
	this.debug = config["debug"] || false;
	this.debug && this.log('Httpthingspeak: reading config');

	// url info
	this.url = config["url"];
	this.http_method = config["http_method"] || "GET";
	this.name = config["name"];
	this.type = config["type"];
	this.manufacturer = config["manufacturer"] || "Sample Manufacturer";
	this.model = config["model"] || "Sample Model";
	this.serial = config["serial"] || "Sample Serial";
	this.temperatureService;
	this.humidityService;
}

Httpthingspeak.prototype = {
	httpRequest: function (url, method, callback) {
		this.debug && this.log('httpRequest: '+method+' '+url);
		request({
			uri: url,
			method: method,
			rejectUnauthorized: false
		},
			function (error, response, body) {
				callback(error, response, body)
			})
	},

	getSensorTemperatureValue: function (callback) {
		this.debug && this.log('getSensorTemperatureValue');
		this.httpRequest(this.url,this.http_method,function(error, response, body) {
			if (error) {
				this.log('HTTP get failed: %s', error.message);
				callback(error);
			} else {
				this.debug && this.log('HTTP success. Got result ['+body+']');
				for(const k in JSON.parse(body)) {
					if(k.indexOf("field") > -1)
						var value = parseFloat(JSON.parse(body)[k]);
				}
				this.temperatureService.setCharacteristic(
					Characteristic.CurrentTemperature,
					value
				);
				callback(null, value);
			}
		}.bind(this));
	},

	getSensorHumidityValue: function (callback) {
		this.debug && this.log('getSensorHumidityValue');
		this.httpRequest(this.url,this.http_method,function(error, response, body) {
			if (error) {
				this.log('HTTP get failed: %s', error.message);
				callback(error);
			} else {
				this.debug && this.log('HTTP success. Got result ['+body+']');
				for(const k in JSON.parse(body)) {
					if(k.indexOf("field") > -1)
						var value = parseFloat(JSON.parse(body)[k]);
				}
				this.temperatureService.setCharacteristic(
					Characteristic.CurrentRelativeHumidity,
					value
				);
				callback(null, value);
			}
		}.bind(this));
	},

	identify: function (callback) {
		this.log("Identify requested!");
		callback(); // success
	},

	getServices: function () {
		this.debug && this.log("getServiecs");
		var services = [],
			informationService = new Service.AccessoryInformation();

		informationService
			.setCharacteristic(Characteristic.Manufacturer, this.manufacturer)
			.setCharacteristic(Characteristic.Model, this.model)
			.setCharacteristic(Characteristic.SerialNumber, this.serial);
		services.push(informationService);

		switch (this.type) {
			case "CurrentTemperature":
				this.temperatureService = new Service.TemperatureSensor(this.name);
				this.temperatureService
					.getCharacteristic(Characteristic.CurrentTemperature)
					.on('get', this.getSensorTemperatureValue.bind(this));
				services.push(this.temperatureService);
				break;
			case "CurrentRelativeHumidity":
				this.temperatureService = new Service.HumiditySensor(this.name);
				this.temperatureService
					.getCharacteristic(Characteristic.CurrentRelativeHumidity)
					.on('get', this.getSensorHumidityValue.bind(this));
				services.push(this.temperatureService);
				break;
			default:
				this.log('Error: unknown type: '+this.type+'. skipping...');
		}
		return services;
	}
};


