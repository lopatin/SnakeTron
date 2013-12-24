(function() {
  define(['underscore', 'api'], function(_, Api) {
    var App;

    App = (function() {
      function App() {
        _.bindAll(this);
      }

      App.prototype.init = function(view) {
        this.view = view;
        this._startHeartbeat();
        Api.call('getUser', this._fetchedUser);
        return Api.listen('playerCount', function(count) {
          return console.log(count);
        });
      };

      App.prototype.getUser = function() {
        return this.user;
      };

      App.prototype._fetchedUser = function(err, user) {
        if (err) {
          return console.log(err);
        } else {
          this.user = user;
          this.view.showIndexView();
          return console.log("Logged in user: " + user.name);
        }
      };

      App.prototype._startHeartbeat = function() {
        Api.call('hartbeet');
        return setInterval(function() {
          return Api.call('hartbeet');
        }, 1000);
      };

      return App;

    })();
    window.newapp = new App();
    return window.newapp;
  });

}).call(this);
