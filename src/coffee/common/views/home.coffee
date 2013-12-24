define [
  'jquery'
  'underscore'
  'backbone'
  'app'
  'hb!/templates/home.hb'
], ($, _, Backbone, app, homeTemplate) ->
  HomeView = Backbone.View.extend
    initialize: ->

    render: ->
      @$el.html homeTemplate({
        name: app.getUser().name
        })