
var WebSocketServer = require('websocket').server;
var http = require('http');
var url = require('url');

const find = require('local-devices');
 
// Find all local network devices.
find().then(devices => {
	console.log(devices);
})

var server = http.createServer((req, res) => {

	var q = url.parse(req.url, true).query;
	res.write('yo ' + q.what); //write a response to the client
	res.end();

	if (connection) {
		connection.send('alors du coup ouaaaaaaiiiii ' + q.what + '::' + req.url);
	}

});
server.listen(3333, function() { });

// create the server
wsServer = new WebSocketServer({
  httpServer: server
});

let connection;

// WebSocket server
wsServer.on('request', function(request) {
  connection = request.accept(null, request.origin);

  console.log('req');
  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message) {
	  console.log('msg');

    if (message.type === 'utf8') {
	  // process WebSocket message
	  connection.send('ok manne');
    }
  });

  setTimeout(() => {
	connection.send('alors du coup ouaaaaaaiiiii');
  }, 5000);

  connection.on('close', function(connection) {
    // close user connection
  });
});