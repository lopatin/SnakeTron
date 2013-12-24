(function() {
  define(['jquery', 'underscore', 'backbone', 'app', 'hb!/templates/application.hb', 'views/header', 'views/home', 'views/marketing', 'views/leaderboards'], function($, _, Backbone, app, appTemplate, HeaderView, HomeView, MarketingView, LeaderboardsView) {
    var ApplicationView;

    return ApplicationView = Backbone.View.extend({
      initialize: function() {
        this.children = {
          header: new HeaderView(),
          home: new HomeView(),
          marketing: new MarketingView(),
          leaderboards: new LeaderboardsView()
        };
        this.render();
        return this.routes();
      },
      render: function() {
        this.$el.html(appTemplate());
        this.children.header.setElement(this.$el.find('.header'));
        return this.children.header.render();
      },
      routes: function() {
        var router;

        _.bindAll(this);
        router = this.options.router;
        router.on('route:index', this.index);
        router.on('route:leaderboards', this.leaderboards);
        router.on('route:instructions', this.instructions);
        return router.on('route:logout', this.logout);
      },
      index: function() {
        this.children.header.select('home');
        return this.showIndexView();
      },
      showIndexView: function() {
        if (app.getUser()) {
          return this.showContentView(this.children.home);
        } else {
          return this.showContentView(this.children.marketing);
        }
      },
      leaderboards: function() {
        this.children.header.select('leaderboards');
        return this.showContentView(this.children.leaderboards);
      },
      instructions: function() {
        return this.children.header.select('instructions');
      },
      showContentView: function(view) {
        view.setElement(this.$el.find('.content'));
        return view.render();
      },
      logout: function() {
        return window.location.reload();
      }
    });
  });

}).call(this);
