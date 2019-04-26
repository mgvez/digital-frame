
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const { LOG_FILE, LOG_LEVEL } = require(__dirname + '/../config.js');


const logFormat = printf(({ level, message, label, timestamp }) => {
	return `[${timestamp}] ${message}`;
});
const logger = createLogger({
	level: LOG_LEVEL,
	format:  combine(
		timestamp(),
		logFormat
	),
	defaultMeta: { service: 'user-service' },
	transports: [
		new transports.File({ filename: LOG_FILE, level: LOG_LEVEL }),
	]
});

module.exports = logger;