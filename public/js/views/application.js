(function() {
  define(['jquery', 'underscore', 'backbone', 'hb!/templates/application.hb'], function($, _, Backbone, appTemplate) {
    var ApplicationView;

    ApplicationView = Backbone.View.extend({
      initialize: function() {
        return this.render();
      },
      render: function() {
        return this.$el.html(appTemplate());
      }
    });
    return ApplicationView;
  });

}).call(this);
