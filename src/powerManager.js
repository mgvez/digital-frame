
const cron = require('node-cron');
const { exec } = require('child_process');
const findDevices = require('local-devices');
const { POWER_TIME, GEOFENCING_DEVICES } = require(__dirname + '/../config.js');

let server;
let electronApp;
let isOn = true;
let isScheduledOn = true;
let isSomeoneHome = true;

function turnOn() {
	console.log('ON');
	if (!isOn && electronApp) electronApp.start();
	isOn = true;
	//cec turn on
	exec('echo "on 0" | cec-client -s -d 1');

}

function turnOff() {
	isOn = false;
	if (electronApp) electronApp.stop();
	console.log('OFF');
	//cec turn off
	exec('echo "standby 0" | cec-client -s -d 1');
}

function turnOnScheduled() {
	isScheduledOn = true;
	if (isSomeoneHome) turnOn();
}

function turnOffScheduled() {
	isScheduledOn = false;
	console.log('OFF scheduled');
	turnOff();
}

function turnOffGeofence() {
	console.log('OFF geofence');

	turnOff();
}

function turnOnGeofence() {
	if (isScheduledOn) turnOn();
}

function forceOn() {
	isScheduledOn = true;
	this.turnOn();
}

function forceOff() {
	isScheduledOn = false;
	console.log('OFF requested');

	this.turnOff();
}

function geoFence() {

	if (!GEOFENCING_DEVICES || GEOFENCING_DEVICES.length === 0) return;

	findDevices().then(devices => {
		const hasOne = devices.reduce((carry, device) => {
			return carry || ~GEOFENCING_DEVICES.indexOf(device.mac);
		}, false);
		// console.log(devices);
		// console.log(hasOne);

		if (!hasOne && isSomeoneHome) {
			isSomeoneHome = false;
			turnOffGeofence();
		} else if (hasOne && !isSomeoneHome) {
			isSomeoneHome = true;
			turnOnGeofence();
		}

	});
}

function registerCron() {
	const now = new Date();
	const nowDay = now.getDay();
	const nowMinute = now.getMinutes();
	const nowHour = now.getHours();

	POWER_TIME.forEach((times, day) => {
		const [ timeOn, timeOff ] = times;
		// console.log(turnOn);
		const [ hourOn, minuteOn ] = timeOn.split(':').map(Number);
		const [ hourOff, minuteOff ] = timeOff.split(':').map(Number);
		// console.log(hourOn, minuteOn, hourOff, minuteOff);
		cron.schedule(`* ${minuteOn} ${hourOn} * ${day}`, turnOnScheduled);
		cron.schedule(`* ${minuteOff} ${hourOff} * ${day}`, turnOffScheduled);

		if (nowDay === day) {
			console.log(`now:${nowHour}, on:${hourOn}, off:${hourOff}`);
			if (nowHour < hourOn || nowHour > hourOff || (nowHour === hourOn && nowMinute <= minuteOn) || (nowHour === hourOff && nowMinute >= minuteOff)) {
				turnOffScheduled();
			}
		}

	});
	cron.schedule(`* * * * *`, geoFence);
	geoFence();

}


module.exports = {
	init: (s, e) => {
		server = s;
		electronApp = e;
		registerCron();

		server.setStartCallback(forceOn);
		server.setStopCallback(forceOff);
	}
};
