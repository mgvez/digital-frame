

const { app, BrowserWindow } = require('electron')
const path = require('path');

let win;
const isDev = process.argv.includes('dev');
const isConsole = process.argv.includes('console');
module.exports = function(server) {
	function createWindow () {
		console.log('creating electron window');
		win = new BrowserWindow({ 
			width: 500,
			height: 800,
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
