(function() {
  define(['jquery', 'underscore', 'backbone', 'app', 'hb!/templates/home.hb'], function($, _, Backbone, app, homeTemplate) {
    var HomeView;

    return HomeView = Backbone.View.extend({
      initialize: function() {},
      render: function() {
        return this.$el.html(homeTemplate({
          name: app.getUser().name
        }));
      }
    });
  });

}).call(this);
