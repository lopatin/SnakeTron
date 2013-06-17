(function() {
  define(['redisclient', 'player', 'match', 'utils/playercounter'], function(redis, Player, Match, PlayerCounter) {
    var Snaketron;

    Snaketron = (function() {
      function Snaketron() {
        this.players = [];
      }

      Snaketron.prototype.socketConnected = function(socket) {
        return this.players.push(new Player(socket));
      };

      Snaketron.prototype.socketDisconnected = function(socket) {
        return PlayerCounter.remove(socket);
      };

      return Snaketron;

    })();
    return new Snaketron();
  });

}).call(this);
