(function() {
  define(['redisclient', 'player', 'match', 'utils/playercounter'], function(redis, Player, Match, PlayerCounter) {
    var Snaketron;

    Snaketron = (function() {
      function Snaketron() {
        this.players = [];
      }

      Snaketron.prototype.socket_connected = function(socket) {
        return this.players.push(new Player(socket));
      };

      Snaketron.prototype.socket_disconnected = function(socket) {
        return PlayerCounter.remove_socket(socket);
      };

      return Snaketron;

    })();
    return new Snaketron();
  });

}).call(this);
