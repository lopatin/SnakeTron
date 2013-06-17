#
# Main Snaketron server-side class
# 
define [
	'redisclient'
	'player'
	'match'
	'utils/playercounter'
	], (redis, Player, Match, PlayerCounter) ->
	class Snaketron
		constructor: () ->
			@players = []

		socketConnected: (socket) ->
			@players.push new Player socket

		socketDisconnected: (socket) ->
			PlayerCounter.remove socket


	return new Snaketron()
