

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');

const { SLIDESHOW_DURATION } = require(__dirname + '/../config.js');

let win;
const isDev = process.argv.includes('dev');
const isConsole = process.argv.includes('console');

//if window does not notify for that long, we restart the process.
const MAX_NO_RESPONSE = (SLIDESHOW_DURATION + 60) * 1000;

module.exports = function(server) {

	//interval that will run and restart the process if it did not notify for too long
	let statusInterval;

	function forceRestart() {
		clearInterval(statusInterval);
		if (isDev) return;
		stop();
		setTimeout(start, 1000);
	}

	function stop() {
		if (win) {
			win.webContents.send('message', 'stop');
			win.close();
			win = null;
			clearInterval(statusInterval);
		}
	};

	function start() {
		createWindow('start');
		win.webContents.send('message', 'start');
		statusInterval = setInterval(forceRestart, MAX_NO_RESPONSE);
	};

	function createWindow (arg) {
		if (win) return;
		console.log('creating electron window ' + arg);
		win = new BrowserWindow({ 
			width: 1200,
			height: 1000,
			autoHideMenuBar: true,
			alwaysOnTop: !isDev,
			fullscreen: !isDev,
			frame: false,
		})
	
		win.loadFile('./src/electron/index.html');
	
		if (isDev || isConsole) {
			win.webContents.openDevTools();
		}
	
		win.webContents.on('dom-ready', () => {
			win.webContents.send('load', app.getAppPath());
		});
	
		server.setMessageCallback((message, data = null) => {
			switch (message) {
				// case 'start':
				// 	start();
				// 	break;
				// case 'stop':
				// 	stop();
				// 	break;
				default:
					// console.log('sending custom message');
					win.webContents.send('message', message, data);
			};
		});
	
		win.on('closed', () => {
			win = null;
		});
	}
	
	app.on('ready', createWindow)
	
	app.on('window-all-closed', () => {
		// app.quit();
	});
	
	// app.on('activate', () => {
	// 	if (win === null) {
	// 		createWindow('activate');
	// 	}
	// });

	let lastTime = new Date();
	ipcMain.on('slide', (event, arg) => {
		const now = new Date();
		const duration = now - lastTime;
		console.log(duration);
		lastTime = now;
		clearInterval(statusInterval);
		statusInterval = setInterval(forceRestart, MAX_NO_RESPONSE);
	});

	this.stop = stop;
	
	this.start = start;

}
