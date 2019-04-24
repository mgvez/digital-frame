

module.exports = {
	FRAME_WIDTH: 3840,
	FRAME_HEIGHT: 2160,

	SLIDESHOW_DURATION: 2,//seconds
	SLIDESHOW_TRANSITION_DURATION: 3,//seconds

	HISTORY_SIZE: 50,

	HTTP_PORT: '3333',
	IP_WHITELIST: false,
	IMAGE_ROOT: '/../images/digital-frame',

	//from 0 (sunday) to saturday (6)
	POWER_TIME: [
		['08:00', '21:00'],
		['07:00', '22:00'],
		['07:00', '22:00'],
		['07:00', '22:00'],
		['07:00', '22:00'],
		['07:00', '23:00'],
		['08:00', '23:00'],
	],

	//MAC addresses of devices that will turn on the device, when they are on the network. When none of these devices is on the network, device will remain powered off
	GEOFENCING_DEVICES: [
		
	],

	LOG_FILE: __dirname + '/../dframe-log.txt',

}
