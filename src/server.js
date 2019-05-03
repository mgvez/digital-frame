

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

const browserify = require('browserify');


const { getDirectoryTree } = require(__dirname + '/common/files.js');


const { HTTP_PORT, IP_WHITELIST, IMAGE_ROOT } = require(__dirname + '/../config.js');

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


	//serve a page so that devices on the network can control the slideshow
	app.get('/', function(req, res) {
		const html = fs.readFileSync(path.resolve(__dirname + '/server/index.html'), { encoding: 'utf8' });
		res.send(html);
	});

	app.get('/static/main.js', (req, res, next) => {
		const writer = fs.createWriteStream(__dirname + '/../static/main.js');

		const builder = browserify();
		builder.add(__dirname + '/server/app/Main.js');
		builder.bundle().on('error', next).pipe(writer.on('finish', next));
	});
	app.use('/static', express.static(__dirname + '/../static'));


	app.get('/getTree', function(req, res) {

		getDirectoryTree(__dirname + '/..' + IMAGE_ROOT).then((tree) => {
			// console.log(tree);
			res.send(tree);
		});
	});

	this.setMessageCallback = (cb) => {
		this.onMessage = cb;
	};

	this.setStopCallback = (cb) => {
		this.onStop = cb;
	};
	this.setStartCallback = (cb) => {
		this.onStart = cb;
	};

	io.on('connection', (socket) => {

		this.onMessage && this.onMessage('socket-connect');

		//receive message from remote app, controlling the slideshow.

		socket.on('changedir', (data) => {
			// console.log(data);
			this.onMessage && this.onMessage('changedir', data);
		});
		

		socket.on('message', (msg) => {
			console.log(msg);
			switch(msg) {
				case 'start':
					this.onStart && this.onStart();
					break;
				case 'stop':
					this.onStop && this.onStop();
					break;
				case 'reboot':
					// console.log(childProcess);
					childProcess.exec('sudo reboot now', function(error, stdout, stderr){ 
						logger.log({
							level: 'info',
							message: error,
						});
					});
					break;
				default:
					this.onMessage && this.onMessage(msg);
					
			}

		});

	});

}
