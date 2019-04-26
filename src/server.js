

const express = require('express');
const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server);
var path = require('path');
const ipfilter = require('express-ipfilter').IpFilter;
const fs = require('fs');
const helmet = require('helmet');
const childProcess = require('child_process');
const logger = require(__dirname + '/logger.js');

const { HTTP_PORT, IP_WHITELIST } = require(__dirname + '/../config.js');

module.exports = function() {
	console.log('starting server...');
	server.listen(HTTP_PORT);
	console.log(`server listening on ${HTTP_PORT}`);

	if (IP_WHITELIST) {
		app.use(function(req, res, next) {
			ipfilter(IP_WHITELIST, {
				mode: IP_WHITELIST.length === 0 ? 'deny' : 'allow',
				log: false,
			})(req, res, function(err) {
				if (err === undefined) {
					return next();
				}
				console.log(err.message);
				res.status(403).send("Denied");
			});
		});
	}

	app.use(helmet());

	app.use('/static', express.static(__dirname + '/../static'));

	app.get('/', function(req, res) {
		const html = fs.readFileSync(path.resolve(__dirname + '/server/index.html'), { encoding: 'utf8' });
		res.send(html);
	});

	this.setMessageCallback = (cb) => {
		this.onMessage = cb;
	};

	io.on('connection', (socket) => {

		this.onMessage && this.onMessage('socket-connect');

		socket.on('message', (msg) => {

			switch(msg) {
				case 'reboot':
					// console.log(childProcess);
					logger.log({
						level: 'info',
						message: require("os").userInfo().username,
					});
					childProcess.exec('reboot now', function(error, stdout, stderr){ console.log(stdout); });
					break;
			}

			this.onMessage && this.onMessage(msg);
		});

	});
	

	// app.get('/message', (req, res) => {
	// 	console.log(req);
	// 	this.onMessage && this.onMessage('test yo');
	// 	// res.send("c'est boooooo");
	// });

}


