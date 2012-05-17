var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);  // Socket.io
var async = require('async');               // Flow control

var mysqlConfig = require('./mysqlConfig');

app.listen(8081);

// Database
var mysql = require('mysql');
var client = mysql.createClient({
  user: mysqlConfig.username,
  password: mysqlConfig.password
});
client.query("USE snaketron"); 

// Public files config
app.configure(function(){
    app.use(express.static(__dirname + '/public'));
});

app.get('/', function(req, res){
    res.send('hi');
});

var playerQueue = [];
var games = {};

io.sockets.on('connection', function(socket){
    socket.on('register', function(data){
        client.query('SELECT * FROM users WHERE username="'+data.username+'"', function(err, results){
            if(results.length > 0)
                socket.emit('register-error', {error: "Username in use"});
            else {
                client.query('INSERT INTO users VALUES ("", "'+data.username+'", "'+data.password+'")', function(err, results){
                    socket.emit('menu', {username: data.username});
                    
                    playerQueue.push({
                        uid: getUID(),
                        socket: socket,
                        username: data.username
                    });
                });
            }
        });
    });

    socket.on('login', function(data){
        client.query('SELECT * FROM users WHERE username="'+data.username+'" AND password="'+data.password+'"', function(err, results){
            if((!err && results.length > 0) || data.anon){
                if(data.anon)
                    getAnonName(function(newName){
                        socket.emit('menu', {username: newName});
                    });
                else 
                        socket.emit('menu', {username: data.username});
                
            }
            else socket.emit('login-error', {error: "Invalid username or password"});
        });
    });

    socket.on('random-opponent', function(username){
        playerQueue.push({
            uid: getUID(),
            socket: socket,
            username: username
        });
        connectPlayers();
    });

    socket.on('eaten-snack', function(data){
       emitToAll(data.gameId, 'remove-snack', {id: data.snackId, weight: data.snackWeight, pid: data.partnerId});
//        games[data.gameId].players[data.partnerId].emit('addScore', data.snackWeight);
        sendSnacks(data.gameId);

        if(games[data.gameId].snacks[data.snackId])
            delete games[data.gameId].snacks[data.snackId];

    });

    socket.on('disconnect', function(){
        for(var i = 0; i < playerQueue.length; i++){
            if(playerQueue[i].socket == socket)
                playerQueue.splice(i,1);
        }
        
        for(key in games){
            if(games.hasOwnProperty(key)){
                for(pid in games[key].players){
                    if(games[key] && games[key].players.hasOwnProperty(pid)){
                        if(socket == games[key].players[pid])
                            delete games[key];
                    }
                }
            }
        }
    });

    socket.on('send-direction', function(data){
        if(games[data.g])
            games[data.g].players[data.id].emit('add-direction', data);
    });

    socket.on('dead', function(data){
        if(games[data.gameId] && games[data.gameId].active){
            games[data.gameId].active = false;
            emitToAll(data.gameId, 'gameover', games[data.gameId].players[data.partnerId].username);
            saveGame(data); 
        }
    });

    socket.on('draw', function(data){
        if(games[data.gameId] && games[data.gameId].active){
            games[data.gameId].active = false;
            emitToAll(data.gameId, 'draw', data);
            saveGame(data);
        }
    });

    socket.on('send-points', function(data){
        if(games[data.g] && games[data.g].active){
            //games[data.g].players[data.id].emit('send-points', data.p);
        }
    })
});

function saveGame(data){
            var me, them;
            for(key in games[data.gameId].players)
                if(games[data.gameId].players.hasOwnProperty(key)){
                    if(key === data.partnerId)
                        them = {
                            name: games[data.gameId].players[key].username,
                            score: data.doub ? 2*data.oScore : data.oScore};
                    else
                        me = {
                            name: games[data.gameId].players[key].username,
                            score: data.myScore};
                }
            client.query("INSERT INTO games VALUES('', '"+me.name+"', '"+them.name+"', '"+me.score+"', '"+them.score+"')");
} 

function getAnonName(cb){
    var anonName;
    async.series([
        function(callback){
            client.query('INSERT INTO anons VALUES("")', function(err, info){
                callback(null, info.insertId);
            });
        }
    ], function(err, results){
            anonName = "Anon #"+results[0];
            cb(anonName);
        });
}

function connectPlayers(){
    if(playerQueue.length >= 2){
        var player1 = playerQueue.shift(),
            player2 = playerQueue.shift(),
            gameId = getUID();

        games[gameId] = { players: { }, snacks: {} };
        games[gameId].players[player1.uid] = player1.socket;
        games[gameId].players[player1.uid].username = player1.username;
        games[gameId].players[player2.uid] = player2.socket;
        games[gameId].players[player2.uid].username = player2.username;
        
        player2.socket.emit('start-game', {
            gameId: gameId,
            partnerId: player1.uid,
            partnerUsername: player1.username,
            position: 'right'
        });
        player1.socket.emit('start-game', {
            gameId: gameId,
            partnerId: player2.uid,
            partnerUsername: player2.username,
            position: 'left'
        });
        games[gameId].active = true;
        //iterateGame(gameId);
        sendSnacks(gameId);
        sendSnacks(gameId);
    }
    else{
        var player = playerQueue[0];
        player.socket.emit('waiting', {});
    }
}

function iterateGame(gameId){
    // Don't continue to iterate if game is inactive
    if(games[gameId] && !games[gameId].active) return;

    emitToAll(gameId, 'i', {});
    setTimeout(function(){
        if(games[gameId])
            iterateGame(gameId);
    }, 100);
}

// send snacks
function sendSnacks(gameId){
    var game = games[gameId];
    var x = Math.floor(Math.random()*80);
    var y = Math.floor(Math.random()*40);
    var sid = getUID();
    game.snacks[sid] = {id: sid, x: x, y: y, weight: 5};

    emitToAll(gameId, 'snack', game.snacks[sid]);
}

function emitToAll(gameId, messageName, data){
    var game = games[gameId];
    for (var pid in game.players){
        if(game.players.hasOwnProperty(pid)){
            game.players[pid].emit(messageName, data);
        }
    }
}

function getUID(){
    return (Date.now()) + 'x' + Math.round(Math.random() *1E18);
}
