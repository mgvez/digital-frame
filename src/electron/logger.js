
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;


const logFormat = printf(({ level, message, label, timestamp }) => {
	return `[${timestamp}] ${message}`;
});
const logger = createLogger({
	level: 'info',
	format:  combine(
		timestamp(),
		logFormat
	),
	defaultMeta: { service: 'user-service' },
	transports: [
		new transports.File({ filename: LOG_FILE, level: 'info' }),
	]
});

module.exports = logger;