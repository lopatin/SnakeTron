#
# Main client application
#

define [
  'underscore'
  'api'
], (_, Api) ->
  class App
    constructor: () ->
      _.bindAll this

    init: (view) ->
      @view = view
      @_startHeartbeat()
      Api.call 'getUser', @_fetchedUser

      Api.listen 'playerCount', (count) ->
        console.log count

      # setInterval () ->
      #   Api.call 'getPlayerCount', (err, count) ->
      #     console.log count
      # , 1000

    getUser: () ->
      @user

    # User returned from server by api call
    _fetchedUser: (err, user) ->
      if err
        console.log err
      else
        @user = user
        @view.showIndexView()
        console.log "Logged in user: #{user.name}"

    # Emit a regular heartbeat as a hack to keep count of online users
    _startHeartbeat: () ->
      Api.call 'hartbeet'
      setInterval ->
        Api.call 'hartbeet'
      , 1000

  window.newapp = new App()
  return window.newapp
