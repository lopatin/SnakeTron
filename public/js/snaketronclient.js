(function() {
  require.config({
    paths: {
      'underscore': 'libs/underscore',
      'backbone': 'libs/backbone',
      'jquery': 'libs/jquery',
      'text': 'libs/text',
      'handlebars': 'libs/hb',
      'hb': 'libs/hbtemplate',
      'socketio': '/socket.io/socket.io.js'
    },
    shim: {
      'underscore': {
        exports: '_'
      },
      'backbone': {
        deps: ['underscore', 'jquery'],
        exports: 'Backbone'
      },
      'socketio': {
        exports: 'io'
      },
      'handlebars': {
        exports: 'Handlebars'
      }
    }
  });

  define(['underscore', 'socketio', 'views/application'], function(_, io, ApplicationView) {
    var l, socket;

    l = window.location;
    socket = io.connect(l.protocol + l.host);
    socket.emit('hartbeet');
    setInterval(function() {
      return socket.emit('hartbeet');
    }, 1000);
    return $(function() {
      var appView;

      appView = new ApplicationView({
        el: $("body")
      });
      return console.log(appView);
    });
  });

}).call(this);
