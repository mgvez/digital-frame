

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

	//serve a page so that devices on the network can control the slideshow
	app.get('/', function(req, res) {
		const html = fs.readFileSync(path.resolve(__dirname + '/server/index.html'), { encoding: 'utf8' });
		res.send(html);
	});

	this.setMessageCallback = (cb) => {
		this.onMessage = cb;
	};

	io.on('connection', (socket) => {

		this.onMessage && this.onMessage('socket-connect');

		//receive message from remote app, controlling the slideshow.
		socket.on('message', (msg) => {

			switch(msg) {
				case 'reboot':
					// console.log(childProcess);
					childProcess.exec('sudo reboot now', function(error, stdout, stderr){ 
						logger.log({
							level: 'info',
							message: error,
						});
					});
					break;
			}

			this.onMessage && this.onMessage(msg);
		});

	});

}


