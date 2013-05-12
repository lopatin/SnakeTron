var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);  // Socket.io
var async = require('async');               // Flow control
var _ = require('underscore');
// var passHash = require('./passHash');

app.listen(8081);


// Public files config
app.configure(function(){
    app.use(express.static(__dirname + '/public'));
});

