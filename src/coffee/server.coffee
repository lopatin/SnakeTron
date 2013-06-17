requirejs = require 'requirejs'

# Require.js configuration
requirejs.config
	baseUrl: __dirname+"/lib",
	paths:
		common: __dirname+"/public/js"
	nodeRequire: require

# Main server code
requirejs [
	'snaketron'
	'express'
	'socket.io'
	'http'
	], (snaketron, express, socketio, http) ->

		# Express web server
		app = express()
		app.configure () ->
			app.use express.static __dirname+'/public'
		server = http.createServer app
		server.listen 8080

		# Socket.io websocket server
		io = socketio.listen server
		io.sockets.on 'connection', (socket) ->
			snaketron.socketConnected socket
