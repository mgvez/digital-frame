

const { app, BrowserWindow } = require('electron')
const path = require('path');

let win;
const isDev = process.argv.includes('dev');

module.exports = function(server) {
	function createWindow () {
		console.log('creating electron window');
		win = new BrowserWindow({ 
			width: 1600,
			height: 600,
			autoHideMenuBar: true,
			alwaysOnTop: !isDev,
			fullscreen: !isDev,
			frame: false,
		})
	
		win.loadFile('./src/electron/index.html');
	
		if (isDev) {
			win.webContents.openDevTools();
		}
	
		win.webContents.on('dom-ready', () => {
			win.webContents.send('load', app.getAppPath());
		});
	
		server.onMessage = (message) => {
			win.webContents.send('message', message);
		};
	
		win.on('closed', () => {
			win = null;
		});
	}
	
	app.on('ready', createWindow)
	
	app.on('window-all-closed', () => {
		app.quit();
	});
	
	app.on('activate', () => {
		if (win === null) {
			createWindow();
		}
	});

	this.stop = () => {
		win.webContents.send('message', 'stop');
	}
	
	this.start = () => {
		win.webContents.send('message', 'start');
	}

}
