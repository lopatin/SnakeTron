define [
	'jquery'
	'underscore'
	'backbone'
	'hb!/templates/application.hb'
], ($, _, Backbone, appTemplate) ->
	ApplicationView = Backbone.View.extend
		initialize: ->
			@render()

		render: ->
			@$el.html appTemplate()

	return ApplicationView
