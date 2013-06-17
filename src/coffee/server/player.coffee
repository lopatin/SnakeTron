define [
	'underscore'
	'redisclient'
	'utils/playercounter'
], (_, redis, PlayerCounter) ->
	class Player
		constructor: (@socket) ->
			PlayerCounter.add this

		login: (username, password) ->

		register: (username, password, password_confirmation) ->


