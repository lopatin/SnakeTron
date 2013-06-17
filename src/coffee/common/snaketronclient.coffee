require.config
	paths:
		'underscore': 'libs/underscore'
		'backbone': 'libs/backbone'
		'jquery': 'libs/jquery'
		'text': 'libs/text'
		'handlebars' : 'libs/hb'
		'hb' : 'libs/hbtemplate'
		'socketio': '/socket.io/socket.io.js'
	shim:
		'underscore':
			exports: '_'
		'backbone':
			deps: ['underscore', 'jquery']
			exports: 'Backbone'
		'socketio':
			exports: 'io'
		'handlebars':
			exports: 'Handlebars'


define [
	'underscore'
	'socketio'
	'views/application'
], (_, io, ApplicationView) ->
	# _ = require 'underscore'
	l = window.location
	socket = io.connect l.protocol+l.host

	socket.emit 'hartbeet'
	setInterval ->
		socket.emit 'hartbeet'
	, 1000


	$ ->
		appView = new ApplicationView({ el: $("body") })
		console.log appView
