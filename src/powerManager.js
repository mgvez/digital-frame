
const cron = require('node-cron');
const { POWER_TIME, GEOFENCING_DEVICES } = require(__dirname + '/../config.js');

let server;
let electronApp;

function registerCron() {
	POWER_TIME.forEach((times, day) => {
		const [ turnOn, turnOff ] = times;
		console.log(turnOn);
	});
}


module.exports = {
	init: (s, e) => {
		server = s;
		electronApp = e;
		registerCron();
	}
};
