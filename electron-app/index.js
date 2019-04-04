const { app, BrowserWindow } = require('electron')

let win;



function createWindow () {
	// Create the browser window.
	win = new BrowserWindow({ 
		width: 1024,
		height: 800,
		autoHideMenuBar: true,
		alwaysOnTop: true,
		fullscreen: true,
		frame: false,
	})

	win.loadFile('index.html');

	// win.webContents.openDevTools();


	win.webContents.on('dom-ready', () => {
		win.webContents.send('load', app.getAppPath());
	});

	win.on('closed', () => {
		win = null;
	})
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	app.quit();
})

app.on('activate', () => {
	if (win === null) {
		createWindow();
	}
})
