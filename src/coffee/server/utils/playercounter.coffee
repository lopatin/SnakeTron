#
# PlayerCounter is used for calculating the amount of users 
# online right now using heartbeats and timeouts because simple 
# incrementing and decrementing is buggy for some reason
#

define [
	'redisclient'
], (redis) ->
	class PlayerCounter
		constructor: () ->
			redis.del 'connected_players'
			@count = 0
			setInterval @updateCount.bind(this), 1000

		add: (player) ->
			self = this
			player.socket.on 'hartbeet', @heartbeat.bind(this, player) 
			player.socket.on 'disconnect', @remove.bind(this, player)

		remove: (player) ->
			redis.srem 'connected_players', player.socket.id

		heartbeat: (player) ->
			self = this
			if player.hb_timeout then clearTimeout player.hb_timeout
			else redis.sadd 'connected_players', player.socket.id

			player.hb_timeout = setTimeout @remove.bind(this, player), 4100

		updateCount: () ->
			self = this
			redis.scard 'connected_players', (err, val) ->
				self.count = val

	new PlayerCounter()



