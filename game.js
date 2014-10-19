;(function() {
    var Game = function() {
        DEBUG = false
        this.gameObjects = [];
        var canvas = document.getElementById("screen");
        var screen = canvas.getContext("2d");
        var W = window.innerWidth;
        var H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
        console.log(window.devicePixelRatio)
        if (window.devicePixelRatio > 1) {
            screen.scale(window.devicePixelRatio, window.devicePixelRatio);
            canvas.width *= window.devicePixelRatio;
            canvas.height *= window.devicePixelRatio;
            canvas.style.width = W + "px";
            canvas.style.height = H + "px";
        }
        this.size = {
            x: screen.canvas.width,
            y: screen.canvas.height
        };
        this.wrongSound = document.getElementById('wrong-sound');
        this.correctSound = document.getElementById('correct-sound');
        this.wrongSound.load()
        this.correctSound.load()
        this.fired = false;
        this.player = new Player(this);
        this.gameObjects.push(this.player)
        if (DEBUG) {
            this.timer = new Countdown(this, 30, true)
            this.gameObjects.push(this.timer)
            this.timer.start();
        }
        this.bodies = createSquares(this).concat(this.gameObjects);
        var self = this;
        var tick = function() {
            self.update();
            self.draw(screen);
            requestAnimationFrame(tick);
        };
        tick();
    };
    Game.prototype = {
        update: function() {
            reportCollisions(this.bodies);
            for (var i = 0; i < this.bodies.length; i++) {
                if (this.bodies[i].update !== undefined) {
                    this.bodies[i].update();
                }
            }
            var canvas = document.getElementById("screen");
        },
        draw: function(screen) {
            screen.fillStyle = "white"
            screen.fillRect(0, 0, this.size.x, this.size.y);
            for (var i = 0; i < this.bodies.length; i++) {
                if (this.bodies[i].draw !== undefined) {
                    this.bodies[i].draw(screen);
                }
            }
        },
        choice: function(correct) {
            if (correct) {
                this.player.score += 1;
                this.correctSound.currentTime = 0;
                this.correctSound.play();
                if (this.timer !== undefined) this.timer.newRound(false)
            } 
            else {
                this.player.score = 0;
                this.wrongSound.currentTime = 0;
                this.wrongSound.play();
                if (this.timer !== undefined) this.timer.newRound(true)
            }
            this.bodies = createSquares(this).concat(this.gameObjects);
        },
        addBody: function(body) {
            this.bodies.push(body);
        },
        removeBody: function(body) {
            var bodyIndex = this.bodies.indexOf(body);
            if (bodyIndex !== -1) {
                this.bodies.splice(bodyIndex, 1);
            }
        }
    };
    var Countdown = function(game, seconds, permanent, paused) {
        this.game = game;
        this.size = {x: 0, y: 0};
        this.center = {x: 0, y: 0};
        this.startTime = 0;
        this.current = 0;
        this.paused = paused || false;
        this.seconds = (seconds) * 1000;
        this.permanent = permanent;

    };
    Countdown.prototype = {
        start: function() {
            this.paused = false
            this.startTime = Date.now() - this.current + this.seconds
        },
        getTime: function() {
            if (this.startTime - Date.now() <= 0) return 0

            return this.paused ? this.current / 1000 : (this.startTime - Date.now()) / 1000
        },
        reset: function() {
            this.paused = false
            this.startTime = Date.now() + this.seconds
        },
        pause: function() {
            this.paused = true
            this.current = (this.startTime - Date.now())
        },
        newRound: function(wrong) {
            if (!this.permanent || wrong) {
                this.start()
            }
        },
        isZero: function() {
            return this.getTime() == 0 ? true : false;
        },
        draw: function(screen) {
            screen.textAlign = "right";
            screen.font = scoresize + "px Arial"; //  768/12  height/12
            screen.fillText(Math.floor(this.game.timer.getTime()), screen.canvas.width - scoresize / 4, scoresize);
            screen.font = bestsize + "px Arial"; //  768/12  height/12
            screen.fillText(this.game.timer.getTime().toFixed(3).toString().replace(/^[^\.]+/, ''), screen.canvas.width - scoresize / 4, scoresize * (3 / 2));
        }
    };
    var Square = function(game, center, size, color) {
        this.game = game;
        this.center = center;
        this.size = size;
        this.color = color;
        this.correct = correct;
    };
    Square.prototype = {
        draw: function(screen) {
            drawRect(screen, this, this.color);
        },
        collision: function() {
            if (this.correct) this.game.choice(true)
            else this.game.choice(false)
        }
    };
    var createSquares = function(game) {
        var squares = [];
        if (game.player.score < 10) {
            count = game.player.score + 3;
            if (count == 13 || count == 11) {
                count += 1;
            }
        } 
        else count = 20;
        startingOffset = 150;
        difficultySpeed = 0.4;
        colorOffset = Math.ceil(startingOffset * Math.pow(1 + (-difficultySpeed / 10), 10 * (game.player.score / 10)));
        console.log(colorOffset);
        chosen = Math.floor(Math.random() * count + 1);
        color = {
            r: Math.floor(Math.random() * 256),
            g: Math.floor(Math.random() * 256),
            b: Math.floor(Math.random() * 256)
        };
        otherColor = getOtherColor(color, colorOffset);
        hexColor = rgbToHex(color.r, color.g, color.b);
        hexOtherColor = rgbToHex(otherColor.r, otherColor.g, otherColor.b);
        //console.log(hexColor, hexOtherColor, chosen);
        grid = getGrid(count);
        sizex = (game.size.x - ((grid.columns - 1) * game.size.x * 0.02) - (game.size.x * 0.15)) / grid.columns;
        sizey = (game.size.y - ((grid.rows - 1) * game.size.x * 0.02) - (game.size.y * 0.25)) / grid.rows;
        size = Math.min(sizex, sizey, game.size.x * 0.2, game.size.y * 0.2);
        bufferx = (game.size.x - (grid.columns * (size + game.size.x * 0.02))) / 2;
        buffery = (game.size.y - (grid.rows * (size + game.size.y * 0.02))) / 2;
        for (var i = 1; i <= count; i++) {
            var x = bufferx + ((i - 1) % grid.columns) * (size + game.size.x * 0.02) + size / 2;
            var y = buffery + Math.floor((i - 1) / grid.columns) * (size + game.size.x * 0.02) + size / 2;
            if (i == chosen) {
                chosenColor = hexOtherColor;
                correct = true;
            }
else {
                chosenColor = hexColor;
                correct = false;
            }
            squares.push(new Square(game, {x: x, y: y}, {x: size, y: size}, chosenColor, correct));
        }
        return squares;
    };
    var componentToHex = function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    };
    var getOtherColor = function(color, colorOffset) {
        offsetR = Math.floor(Math.random() * (colorOffset + 1));
        offsetG = Math.floor(Math.random() * (offsetR + 1));
        offsetB = colorOffset - (offsetR + offsetG);
        var offsetR = Math.random() < 0.5 ? offsetR : -offsetR;
        var offsetG = Math.random() < 0.5 ? offsetG : -offsetG;
        var offsetB = Math.random() < 0.5 ? offsetB : -offsetB;
        otherColor = {
            r: Math.floor(color.r + offsetR),
            g: Math.floor(color.g + offsetG),
            b: Math.floor(color.b + offsetB)
        };
        if (otherColor.r < 0 || otherColor.r > 255) {
            return getOtherColor(color, colorOffset);
        }
        else if (otherColor.g < 0 || otherColor.g > 255) {
            return getOtherColor(color, colorOffset);
        } 
        else if (otherColor.b < 0 || otherColor.b > 255) {
            return getOtherColor(color, colorOffset);
        } 
        else {
            return otherColor;
        }
    };
    var rgbToHex = function(r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    };
    var getGrid = function(count) {
        if (count % 4 === 0 && count / 4 > 1) {
            k = 4;
            j = count / 4;
        } 
        else if (count % 3 === 0 && count / 3 > 1) {
            k = 3;
            j = count / 3;
        } 
        else if (count % 2 === 0 && count / 2 > 1) {
            k = 2;
            j = count / 2;
        } 
        else if (count < 10) {
            k = 1;
            j = count;
        }
        return {
            rows: k,
            columns: j
        };
    };
    var Player = function(game) {
        this.game = game;
        this.size = {
            x: 15,
            y: 15
        };
        this.center = {
            x: this.game.size.x / 2,
            y: this.game.size.y - 35
        };
        this.score = 0;
        this.best = localStorage.getItem('best') || 0;
        this.input = new Input(this.game);
    };
    Player.prototype = {
        update: function() {
            if (this.input.isTouching()) {
                //console.log(this.input.touchlocX())
                var touch = new Touch(this.game, {
                    x: this.input.touchlocX(),
                    y: this.input.touchlocY()
                }, {
                    x: 0,
                    y: 0
                });
                if (this.game.fired === false) {
                    this.game.addBody(touch);
                    this.game.fired = true;
                }
            }
            if (!this.input.isTouching()) {
                this.game.fired = false;
            }
            if (this.score > this.best) {
                this.best = this.score;
                localStorage.setItem('best', this.best);
            }
            if (this.game.timer !== undefined && this.game.timer.isZero()) {
                this.game.choice(false);
            }
        },
        draw: function(screen) {
            //drawRect(screen, this);
            screen.textAlign = "left";
            scoresize = screen.canvas.height / 10;
            bestsize = (scoresize * 3) / 8;
            screen.fillStyle = "black";
            screen.font = scoresize + "px Arial"; //  768/12  height/12
            screen.fillText(this.game.player.score, scoresize / 4, scoresize);
            screen.font = bestsize + "px Arial";
            screen.fillText("Best: " + this.game.player.best, scoresize / 4, scoresize + bestsize * (5 / 4));
        }
    };
    var Touch = function(game, center, velocity) {
        this.game = game;
        this.center = center;
        this.size = {
            x: 1,
            y: 1
        };
    };
    Touch.prototype = {
        draw: function(screen) {
            drawRect(screen, this, "transparent");
        },
        collision: function() {
            this.game.removeBody(this);
        }
    };
    var Input = function(game) {
        var touching;
        var touchloc = {x: 0, y: 0};
        window.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touching = true;
            touchloc = {
                x: e.touches[0].pageX * window.devicePixelRatio,
                y: e.touches[0].pageY * window.devicePixelRatio
            };
        });
        window.addEventListener('touchend', function(e) {
            touching = false;
        });
        this.isTouching = function() {
            return touching === true;
        };
        this.touchlocX = function() {
            return touchloc.x;
        };
        this.touchlocY = function() {
            return touchloc.y;
        };
    };
    var drawRect = function(screen, body, color) {
        color = typeof color !== 'undefined' ? color : "#000000";
        screen.fillStyle = color;
        screen.fillRect(body.center.x - body.size.x / 2, body.center.y - body.size.y / 2, body.size.x, body.size.y);
    };
    var isColliding = function(b1, b2) {
        return !(b1 === b2 ||
            b1.center.x + b1.size.x / 2 <= b2.center.x - b2.size.x / 2 ||
            b1.center.y + b1.size.y / 2 <= b2.center.y - b2.size.y / 2 ||
            b1.center.x - b1.size.x / 2 >= b2.center.x + b2.size.x / 2 ||
            b1.center.y - b1.size.y / 2 >= b2.center.y + b2.size.y / 2);
    };
    var reportCollisions = function(bodies) {
        var bodyPairs = [];
        for (var i = 0; i < bodies.length; i++) {
            for (var j = i + 1; j < bodies.length; j++) {
                if (isColliding(bodies[i], bodies[j])) {
                    bodyPairs.push([bodies[i], bodies[j]]);
                }
            }
        }
        for (var i = 0; i < bodyPairs.length; i++) {
            if (bodyPairs[i][0].collision !== undefined) {
                bodyPairs[i][0].collision(bodyPairs[i][1]);
            }
            if (bodyPairs[i][1].collision !== undefined) {
                bodyPairs[i][1].collision(bodyPairs[i][0]);
            }
        }
    };
    window.addEventListener('load', function() {
        game = new Game();
    });
})();
