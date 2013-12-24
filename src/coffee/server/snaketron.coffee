#
# Main Snaketron server-side class
# 
define [
	'underscore'
	'redisclient'
	'player'
	'match'
	'playermanager'
	], (_, redis, Player, Match, PlayerManager) ->
	class Snaketron
		constructor: () ->
			@_bindApiMethods()
			@players = new PlayerManager()
			setInterval @_emitPlayerCounts.bind(this), 2000

		socketConnected: (socket, user) ->
			@players.userConnected(user, socket) if user
			@_emitPlayerCounts()

		socketDisconnected: (socket, user) ->
			@players.userDisconnected(user, socket) if user
			@_emitPlayerCounts()

		_emitPlayerCounts: () ->
			count = @players.getCount()
			@players.emit 'playerCount', @players.getCount() if @_lastCount != count
			@_lastCount = count

		_bindApiMethods: () ->
			self = this
			_.each @_api, (method, key) ->
				self._api[key] = method.bind(self)

		apiCall: (method, args, callback) ->
			if not (method? and @._api[method]?)
				error = "Invalid API method"
			else if not args['user']?
				error = "API calls require a user"
			else
				result = @._api[method](args)

			if callback?
				if error?
					callback error
				else 
					callback null, result

		#
		# API methods
		# 
		_api:
			testApiCall: (args) ->
				return args.user.name

			hartbeet: (args) ->
				@players.heartbeat(args.user)

			getPlayerCount: (args) ->
				return @players.getCount()

			getUser: (args) ->
				return args.user
		

	return new Snaketron()
