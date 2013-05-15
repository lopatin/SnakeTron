(function() {
  var requirejs;

  requirejs = require('requirejs');

  requirejs.config({
    baseUrl: __dirname + "/lib",
    paths: {
      common: __dirname + "/public/js"
    },
    nodeRequire: require
  });

  requirejs(['snaketron', 'express', 'socket.io', 'http'], function(snaketron, express, socketio, http) {
    var app, io, server;

    app = express();
    app.configure(function() {
      return app.use(express["static"](__dirname + '/public'));
    });
    server = http.createServer(app);
    server.listen(8080);
    io = socketio.listen(server);
    return io.sockets.on('connection', function(socket) {
      return snaketron.socket_connected(socket);
    });
  });

}).call(this);
