#
# Main Snaketron server-side singleton
# 
define [
	'redisclient',
	'player',
	'match',
	'utils/playercounter'
	], (redis, Player, Match, PlayerCounter) ->
	class Snaketron
		constructor: () ->
			@players = []

		socket_connected: (socket) ->
			@players.push new Player socket

		socket_disconnected: (socket) ->
			PlayerCounter.remove_socket socket


	return new Snaketron()
