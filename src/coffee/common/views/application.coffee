define [
  'jquery'
  'underscore'
  'backbone'
  'app'
  'hb!/templates/application.hb'
  'views/header'
  'views/home'
  'views/marketing'
  'views/leaderboards'
], ($, _, Backbone, app, appTemplate, HeaderView, HomeView, MarketingView, LeaderboardsView) ->
  ApplicationView = Backbone.View.extend
    initialize: ->
      @children =
        header: new HeaderView()
        home: new HomeView()
        marketing: new MarketingView()
        leaderboards: new LeaderboardsView()
      @render()
      @routes()

    render: ->
      @$el.html appTemplate()
      @children.header.setElement @$el.find('.header')
      @children.header.render()

    routes: ->
      _.bindAll @
      router = @options.router
      router.on 'route:index', @index
      router.on 'route:leaderboards', @leaderboards
      router.on 'route:instructions', @instructions
      router.on 'route:logout', @logout

    index: ->
      @children.header.select 'home'
      @showIndexView()

    showIndexView: ->
      if app.getUser()
        @showContentView @children.home
      else
        @showContentView @children.marketing

    leaderboards: ->
      @children.header.select 'leaderboards'
      @showContentView @children.leaderboards

    instructions: ->
      @children.header.select 'instructions'

    showContentView: (view) ->
      view.setElement @$el.find('.content')
      view.render()
      # this is unused
      # @contentView = view

    logout: ->
      window.location.reload()

