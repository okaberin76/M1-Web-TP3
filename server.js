let http = require('http'),
  WebSocketServer = require('ws').Server,
  port = 1234,
  host = '0.0.0.0';

// create a new HTTP server to deal with low level connection details (tcp connections, sockets, http handshakes, etc.)
let server = http.createServer();

// create a WebSocket Server on top of the HTTP server to deal with the WebSocket protocol
let wss = new WebSocketServer({
  server: server
});

// create a function to be able do broadcast messages to all WebSocket connected clients
wss.broadcast = function broadcast(message) {
  wss.clients.forEach(function each(client) {
    client.send(message);
  });
};

let layerList = {index: []};

// Register a listener for new connections on the WebSocket.
wss.on('connection', function(client, request) {
  // retrieve the name in the cookies
  let cookies = request.headers.cookie.split(';');
  let wsname = cookies.find((c) => {
    return c.match(/^\s*wsname/) !== null;
  });
  wsname = wsname.split('=')[1];

  // greet the newly connected user
  client.send(JSON.stringify({
    type: 'SETUP',
    text: 'Welcome, ' + decodeURIComponent(wsname) + '!',
  }));

  // Register a listener on each message of each connection
  client.on('message', function(message) {
    let msg = JSON.parse(message);
    wss.broadcast(JSON.stringify(msg));
  });
});

// http sever starts listening on given host and port.
server.listen(port, host, function() {
  console.log('Listening on ' + server.address().address + ':' + server.address().port);
});

process.on('SIGINT', function() {
  process.exit(0);
});