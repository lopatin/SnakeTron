(function() {
  define(['underscore', 'redisclient', 'utils/playercounter'], function(_, redis, PlayerCounter) {
    var Player;

    return Player = (function() {
      function Player(socket) {
        this.socket = socket;
        PlayerCounter.add(this);
      }

      Player.prototype.login = function(username, password) {};

      Player.prototype.register = function(username, password, password_confirmation) {};

      return Player;

    })();
  });

}).call(this);
