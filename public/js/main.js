
window.addEvent('domready', function(){
	var game = new Snaketron({
		containerId: "snaketron",
		size: {width: 80, height: 40},
		speed: 60
	});

	var socket = io.connect("http://statsonstats.com:8081");
	game.socket = socket;

	socket.on('start-game', function(data){
		game.snacks = [];
		game.gameId = data.gameId;
		game.partnerId = data.partnerId;
		game.partnerUsername = data.partnerUsername;
		game.startGame(data.position);
	});

	socket.on('waiting', function(){
		game.setState('waiting');
	});

	socket.on('menu', function(data){
		if(data && data.username)
			game.username = data.username;
		game.setState('menu');
	})

	socket.on('snack', function(snack){
		game.addSnack(snack);
	});

	socket.on('remove-snack', function(data){
		game.removeSnack(data.id);
		if(data.pid === game.partnerId)
			game.mainSnake.addScore(data.weight);
		else game.otherSnakes[0].addScore(data.weight);
		game.refreshScore();
	});

	socket.on('add-direction', function(data){
		game.addDirection(data.d, data.id);
	});

	socket.on('i', function(){
		game.iterate();
	});

	socket.on('gameover', function(winner){
		game.winner = winner;
		game.setState('gameover');
	});

	socket.on('draw', function(){
		game.setState('gameover', {draw: true});
	})

	$(document.body).addEvent('keydown', function(e){
		if(e.key === 'space' && game.state === 'gameover')
			game.setState('menu');
	})
	//game.addSnack({x: 30, y: 40, weight: 40});
});

var Snaketron = new Class({
	initialize: function(options){
		this.options = options;

		// Initialize container/overlay
		this.container = $(options.containerId);
		this.overlay = new Element('div', {id: 'overlay'});
		this.overlay.inject(this.container);

		// Initialize table
		this.table = new Element('table', {class: 'snaketronTable'});
		this.table.inject(this.container);

		for(var y = 0; y < options.size.height; y++){
			var tr = new Element('tr');
			for(var x = 0; x < options.size.width; x++){
				var td = new Element('td');
				td.inject(tr);
			}
			tr.inject(this.table);
		}

		// Create snakes
		this.mainSnake = new Snake({
			color: "#333333",
			points: [],
			direction: "left"
		});

		this.otherSnakes = [];
		this.partnerSnake = new Snake({
			color: "#999999",
			points: [],
			direction: "right"
		});
		this.otherSnakes.push(this.partnerSnake);

		// Create snacks
		this.snacks = [];

		// Attach key events for movement
		var closure = function (that){
			window.addEvent('keydown', function(e){
				var lastDir = that.mainSnake.directions.getLast();
				if(e.key !== lastDir)
					if((e.key === 'left' && that.mainSnake.directions.getLast() !== 'right')
						|| (e.key === 'right' && that.mainSnake.directions.getLast() !== 'left')
						|| (e.key === 'up' && that.mainSnake.directions.getLast() !== 'down')
						|| (e.key === 'down' && that.mainSnake.directions.getLast() !== 'up'))
						that.sendMyDirection(e.key);
			});
		}(this);

		this.setState('login');
		this.draw();

		// Start game
		//this.iterate();
	},
	iterate: function(){
		//this.syncMyDirections();
		this.mainSnake.step();
		this.checkDeath();
		this.otherSnakes[0].step();
		this.checkDeath();
		this.checkSwallows();
		
		this.draw();
		//this.iterate.delay(this.options.speed, this);
	},
	draw: function(){
		this.clearTails();
		var snakes = Array.clone(this.otherSnakes);
		var that = this;
		snakes.push(this.mainSnake);
		snakes.each(function(snake, index){
			snake.points.each(function(point, index){
				that.colorCell(point.x, point.y, snake.options.color);
			});
		});

		// Draw snacks
		this.snacks.each(function(snack){
			that.colorCell(snack.x, snack.y, "green");
		});
	},
	clearTails: function(){
		var that = this;
		var popped = this.mainSnake.popped;
		if(popped){
			this.colorCell(popped.x, popped.y, "#f6f6f6");
			this.mainSnake.popped = null;
		}

		this.otherSnakes.each(function(snake){
			var popped = snake.popped;
			if(popped){
				that.colorCell(popped.x, popped.y, "#f6f6f6");
				snake.popped = null;
			}
		});
	},
	clearTable: function(){
		this.table.getElements('td').setStyle('background-color', '#f6f6f6');
	},
	colorCell: function(x, y, color){
		var cell = this.table.getElements("tr:nth-child("+y+") td:nth-child("+x+")")[0];
		if(cell)
			cell.setStyle('background-color', color);
	},
	addSnack: function(snack){
		var newSnack = new Snack(snack);
		this.snacks.push(newSnack);
	},
	checkSwallows: function(){
		var that = this;
		this.snacks.each(function(snack){
			if(snack.x === that.mainSnake.points[0].x && snack.y === that.mainSnake.points[0].y){
 				that.snacks.erase(snack);
				that.socket.emit('eaten-snack', {
					gameId: that.gameId,
					partnerId: that.partnerId,
					snackId: snack.id,
					snackWeight: snack.weight
				});
			}
		});
	},
	removeSnack: function(id){
		var that = this;
		this.snacks.each(function(snack){
			if(id === snack.id)
				that.snacks.erase(snack);
		});
	},
	setState: function(state, options){
		var that = this;

		this.clearTable();
		if(state === 'waiting'){
			this.state = 'waiting';
			this.overlay.set('html', '<h3>Waiting for players</h3>');
		}
		else if(state === 'login'){
			this.overlay.set('html', loginTemplate({}));
			this.state = 'login';
			// Set login form events
			this.overlay.getElements('.registerPassword').addEvent('keydown', function(e){
				if(e.key === 'enter')
					that.socket.emit('register', {
						username: that.overlay.getElements('.registerUsername').get('value'),
						password: that.overlay.getElements('.registerPassword').get('value')
					});
			});
			this.overlay.getElements('.loginPassword').addEvent('keydown', function(e){
				if(e.key === 'enter')
					that.socket.emit('login', {
						username: that.overlay.getElements('.loginUsername').get('value'),
						password: that.overlay.getElements('.loginPassword').get('value')
					});
			});
			this.overlay.getElements('.anonSpan a.btn').addEvent('click', function(){
				that.socket.emit('login', {
					anon: true
				});
			});

			this.overlay.getElements('.registerPassword').addEvent('focus', function(e){
				that.overlay.getElements('.registerHelper').show();
			});
			this.overlay.getElements('.registerPassword').addEvent('blur', function(e){
				that.overlay.getElements('.registerHelper').hide();
			});
			this.overlay.getElements('.loginPassword').addEvent('focus', function(e){
				that.overlay.getElements('.loginHelper').show();
			});
			this.overlay.getElements('.loginPassword').addEvent('blur', function(e){
				that.overlay.getElements('.loginHelper').hide();
			});
		}
		else if(state === 'menu'){
			var that = this;
			this.state = 'menu';
			this.overlay.set('html', '<div style="text-align: center; width: 83%; margin: 0 auto 46px auto;">\
			<h3>Welcome, '+this.username+'</h3>\
			<br /><br />\
			<span class="btn btn-success randomOpponent">Play Random Opponent</span>\
			<!--<span style="margin-left: 15px;"> or play against <input style="margin-top: 5px;" type="text" placeholder="Type Username" /></span>-->\
			</div>');

			this.overlay.getElements('.randomOpponent').addEvent('click', function(){
				that.socket.emit('random-opponent', that.username);
			});
			this.refreshScore(true);
		}
		else if(state === 'gameover'){
			var that = this;
			this.state = 'gameover';

			if(options && options.draw)
				this.overlay.set('html', gameOverTemplate({
					winner: "It's a draw!"
				}));
			else
				this.overlay.set('html', gameOverTemplate({
					winner: that.username === that.winner ? "You won!" : that.winner+" won"
				}));
		}
	},
	startGame: function(position){
		this.overlay.set('html', '');
		if(position === 'left'){
			this.mainSnake.points = [{x:25, y:20},{x:24, y:20},{x:23, y:20},{x:22, y:20},{x:21, y:20},{x:20, y:20}];
			this.mainSnake.directions = ["right"];
			this.otherSnakes[0].points = [{x:60, y:20},{x:61, y:20},{x:62, y:20},{x:63, y:20},{x:64, y:20},{x:65, y:20}];
			this.otherSnakes[0].directions = ["left"];
		}
		else if(position === 'right'){
			this.mainSnake.points = [{x:60, y:20},{x:61, y:20},{x:62, y:20},{x:63, y:20},{x:64, y:20},{x:65, y:20}];
			this.mainSnake.directions = ["left"];
			this.otherSnakes[0].points = [{x:25, y:20},{x:24, y:20},{x:23, y:20},{x:22, y:20},{x:21, y:20},{x:20, y:20}];
			this.otherSnakes[0].directions = ["right"];
		}
		this.mainSnake.score = 0;
		this.otherSnakes[0].score = 0;
		this.refreshScore();
	},
	addDirection: function(direction, partnerId){
		if(partnerId === this.partnerId) // If this is the same guy
			this.mainSnake.directions.push(direction);		
		else
			this.otherSnakes[0].directions.push(direction);
		this.draw();
	},
	sendMyDirection: function(key){
		this.socket.emit('send-direction', {
			d: key, 						// directions
			g: this.gameId,					// gameId
			id: this.partnerId				// partnerId
		});
		this.draw();
	},
	checkDeath: function(){
		var that = this;
		var dead = false;
		var draw = false;
		var doub = false;
		var x = this.mainSnake.points[0].x,
			y = this.mainSnake.points[0].y;
		if(x < 0 || y < 0 || x > this.options.width || y > this.options.height)
			dead = true;
		this.otherSnakes.each(function(snake){
			snake.points.each(function(point, index){
				if(point.x === x && point.y === y){
					dead = true;
					if(index === 0)
						draw = true;
					else doub = true;
				}
			});
		});
		this.mainSnake.points.each(function(point, index){
			if(index !== 0 && point.x === that.mainSnake.points[0].x && point.y === that.mainSnake.points[0].y)
				dead = true;
		});

		if(draw)
			this.socket.emit('draw', {gameId: this.gameId, partnerId: this.partnerId, myScore: that.mainSnake.score, oScore: that.otherSnakes[0].score, doub: doub});
		else if(dead)
			this.socket.emit('dead', {gameId: this.gameId, partnerId: this.partnerId, myScore: that.mainSnake.score, oScore: that.otherSnakes[0].score, doub: doub});
	},
	refreshScore: function(clear){
		var that = this;
		var classes = '';
		if(this.mainSnake.score > this.otherSnakes[0].score)
			classes = 'winning';
		else if(this.mainSnake.score < this.otherSnakes[0].score)
			classes = 'losing';

		if(clear && clear === true)
			$('tableHolder').set('html','');
		else
			$('tableHolder').set('html', '<table class="scoreTable">\
			<tr>\
				<td>Your Score</td>\
				<td>'+ that.partnerUsername+'</td>\
			</tr>\
			<tr>\
				<td class="score '+classes+'">'+that.mainSnake.score+'</td>\
				<td class="score">'+that.otherSnakes[0].score+'</td>\
			</tr>\
			</table>');
	}
});

var Snake = new Class({
	initialize: function(options){
		this.options = options;		
		this.points = options.points;
		this.directions = [options.direction];
		this.score = 0;
		this.halt = 0;
	},
	getNewCoords: function(){
		var dir = this.directions.length > 1 ? this.directions.shift() : this.directions[0];
		if(dir === 'left')
			return {x: this.points[0].x - 1, y: this.points[0].y};
		if(dir === 'down')
			return {x: this.points[0].x, y: this.points[0].y + 1};
		if(dir === 'right')
			return {x: this.points[0].x + 1, y: this.points[0].y};
		if(dir === 'up')
			return {x: this.points[0].x , y: this.points[0].y - 1};
	},
	step: function(){
		this.points.unshift(this.getNewCoords());
		if(this.halt === 0)
			this.popped = this.points.pop();
		else {
			this.popped = null;
			this.halt--;
		}
	},
	addScore: function(score){
		this.score += score*100;
		this.halt += score;
	}
});

var Snack = new Class({
	initialize: function(options){
		this.options = options;
		this.x = options.x;
		this.y = options.y;
		this.weight = options.weight;
		this.id = options.id;
	}
});


FocusTracker = {
    startFocusTracking: function() {
       this.store('hasFocus', false);
       this.addEvent('focus', function() { this.store('hasFocus', true); });
       this.addEvent('blur', function() { this.store('hasFocus', false); });
    },

    hasFocus: function() {
       return this.retrieve('hasFocus');
    }
}

Element.implement(FocusTracker);