

const path = require('path');
const HttpServer = require(__dirname + '/server.js');
const Electron = require(__dirname + '/electron.js');
const PowerManager = require(__dirname + '/powerManager.js');

const isDev = process.argv.includes('dev');

//http server that displays controls for the frame on external devices, and communicate these messages to the electron frame
const server = new HttpServer();

//the electron app itself
const electron = new Electron(server);

PowerManager.init(server, electron);
