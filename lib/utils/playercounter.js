(function() {
  define(['redisclient'], function(redis) {
    var PlayerCounter;

    PlayerCounter = (function() {
      function PlayerCounter() {
        redis.del('connected_players');
        this.count = 0;
        setInterval(this.update_count.bind(this), 1000);
      }

      PlayerCounter.prototype.add = function(player) {
        var self;

        self = this;
        player.socket.on('hartbeet', this.heartbeat.bind(this, player));
        return player.socket.on('disconnect', this.remove.bind(this, player));
      };

      PlayerCounter.prototype.remove = function(player) {
        return redis.srem('connected_players', player.socket.id);
      };

      PlayerCounter.prototype.heartbeat = function(player) {
        var self;

        self = this;
        if (player.hb_timeout) {
          clearTimeout(player.hb_timeout);
        } else {
          redis.sadd('connected_players', player.socket.id);
        }
        return player.hb_timeout = setTimeout(this.remove.bind(this, player), 4100);
      };

      PlayerCounter.prototype.update_count = function() {
        var self;

        self = this;
        return redis.scard('connected_players', function(err, val) {
          return self.count = val;
        });
      };

      return PlayerCounter;

    })();
    return new PlayerCounter();
  });

}).call(this);
