

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path');

let win;
const isDev = process.argv.includes('dev');
const isConsole = process.argv.includes('console');
module.exports = function(server) {

	const stop = () => {
		if (win) {
			win.webContents.send('message', 'stop');
			win.close();
			win = null;
		}
	};

	const start = () => {
		createWindow('start');
		win.webContents.send('message', 'start');
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
	
		server.setMessageCallback((message) => {
			switch (message) {
				case 'start':
					start();
					break;
				case 'stop':
					stop();
					break;
				default:
					win.webContents.send('message', message);
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
	});

	this.stop = stop;
	
	this.start = start;

}
