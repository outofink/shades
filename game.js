;(function() {
    var Game = function() {
        DEBUG = false;
        this.gameObjects = [];
        this.isGameOver = false;
        this.textTimer = new Timer(1)
        this.fadeTimer = new Timer(1);
        var canvas = document.getElementById("screen");
        this.display = canvas.getContext("2d");
        var W = window.innerWidth;
        var H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;
        console.log(window.devicePixelRatio)
        if (window.devicePixelRatio > 1) {
            this.display.scale(window.devicePixelRatio, window.devicePixelRatio);
            canvas.width *= window.devicePixelRatio;
            canvas.height *= window.devicePixelRatio;
            canvas.style.width = W + "px";
            canvas.style.height = H + "px";
        }
        this.size = {
            x: this.display.canvas.width,
            y: this.display.canvas.height
        };
        this.fired = false;
        if (DEBUG) {
            this.timer = new Countdown(this, 5, false)
            this.gameObjects.push(this.timer)
            this.timer.start();
        }
        this.player = new Player(this);
        this.gameObjects.push(this.player)
        this.bodies = createSquares(this).concat(this.gameObjects);
        var self = this;
        var tick = function() {
            self.update();
            self.draw(self.display);
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
        },
        draw: function(display) {
            display.fillStyle = "white"
            display.fillRect(0, 0, this.size.x, this.size.y);
            for (var i = 0; i < this.bodies.length; i++) {
                if (this.bodies[i].draw !== undefined) {
                    this.bodies[i].draw(display);
                }
            }
            //if (this.isGameOver) this.gameOver(display)
        },
        picked: function(correct) {
            if (!this.isGameOver) {
                if (correct) {
                    this.player.score += 1;
                    this.bodies = createSquares(this).concat(this.gameObjects);
                    //if (this.timer !== undefined) this.timer.newRound(false)
                } 
                else {
                    this.player.score = 0;
                    //this.isGameOver = true;
                    //if (this.timer !== undefined) this.timer.pause()
                    //this.fadeTimer.start()
                    //if (this.timer !== undefined) this.timer.newRound(true)
                    this.bodies = createSquares(this).concat(this.gameObjects);
                }
                //this.bodies = createSquares(this).concat(this.gameObjects);
            }
        },
        addBody: function(body) {
            this.bodies.push(body);
        },
        removeBody: function(body) {
            var bodyIndex = this.bodies.indexOf(body);
            if (bodyIndex !== -1) {
                this.bodies.splice(bodyIndex, 1);
            }
        },
        gameOver: function(display) {
            squares = this.bodies.filter(function(body) {
                return body instanceof Square;
            });
            //console.log(squares)
            for (i=0; i < squares.length; i++) {
                if (!squares[i].correct) {
                    squares[i].color=fadeColor(squares[i].originalColor,(this.fadeTimer.getTime()/this.fadeTimer.getStopPoint())*.8);
                    //console.log((this.fadeTimer.getTime()/this.fadeTimer.getStopPoint())*.8)
                    
                }
            }
            if (this.fadeTimer.getTime() >= 1 && !this.fadeTimer.complete) {
                this.textTimer.start()
                //console.log(this.textTimer.getTime())
                this.fadeTimer.complete = true;
            }
            //console.log(this.textTimer.getTime())
            display.textAlign = "center";
            display.font = this.size.x/10 + "px Helvetica"; //  768/12  height/12
            display.fillStyle = "rgba(0,0,0,"+this.textTimer.getTime()/this.textTimer.getStopPoint()+")"
            display.fillText("GAME OVER",this.display.canvas.width/2, this.display.canvas.height*(1/4));
            for (i=0; i < squares.length; i++) {
                if (squares[i].correct) {
                    squares[i].color=fadeColor(squares[i].originalColor,(this.textTimer.getTime()/this.textTimer.getStopPoint())*.8);
                }
            }
        }
    };
    var Countdown = function(game, seconds, permanent, paused) {
        this.game = game;
        this.size = {x: -1, y: -1};
        this.center = {x: 1, y: 1};
        this.startTime = 0;
        this.current = 0;
        this.paused = paused || false;
        this.seconds = (seconds) * 1000;
        this.permanent = permanent;
        this.finished = false;

    };
    Countdown.prototype = {
        start: function() {
            this.paused = false
            this.startTime = Date.now() - this.current + this.seconds
            return true
        },
        getTime: function() {
            if (this.startTime - Date.now() <= 0 && !this.paused) return 0
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
        draw: function(display) {
            scoresize = display.canvas.height / 12;
            bestsize = (scoresize * 3) / 8;
            display.textAlign = "right";
            display.font = scoresize + "px Helvetica"; //  768/12  height/12
            display.fillText(Math.floor(this.getTime()), display.canvas.width - scoresize / 4, scoresize);
            display.font = bestsize + "px Helvetica"; //  768/12  height/12
            display.fillText(this.getTime().toFixed(3).toString().replace(/^[^\.]+/, ''), display.canvas.width - scoresize / 4, scoresize * (3 / 2));
        }
    };
    function fadeColor(hex, percent){
    // strip the leading # if it's there
    hex = hex.replace(/^\s*#|\s*$/g, '');
    var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16);

    return '#' +
       ((0|(1<<8) + r + (256 - r) * percent).toString(16)).substr(1) +
       ((0|(1<<8) + g + (256 - g) * percent).toString(16)).substr(1) +
       ((0|(1<<8) + b + (256 - b) * percent).toString(16)).substr(1);
    }
    var pass = function() {};
    var Timer = function(stopPoint) {
        this.startTime = Date.now()
        this.paused = true
        this.current = 0
        this.stopPoint = stopPoint*1000;
        this.complete=false;
        // this.finishedFunction = finishedFunction;
        //this.ranFunction = false
    };
    Timer.prototype = {
        start: function() {
            if (this.paused) {
                this.paused = false
                this.startTime = Date.now() - this.current
            }
        },
        getTime: function() {
            if (Date.now() - this.startTime >= this.stopPoint && !this.paused) {
                this.pause()
                this.current=this.stopPoint;
                // console.log(this.finishedFunction)
                // if (this.finishedFunction !== undefined) this.finishedFunction();
                // if (!this.ranFunction) {
                //     if (this.finishedFunction !== undefined) this.finishedFunction();
                //     this.ranFunction = true;
                // }
                return this.stopPoint/1000  
            } 
            return this.paused ? this.current / 1000 : (Date.now() - this.startTime) / 1000
        },
        getStopPoint: function() {
            return this.stopPoint/1000;
        },
        reset: function() {
            this.paused = false
            this.startTime = Date.now()
        },
        pause: function() {
            this.paused = true
            this.current = (Date.now() - this.startTime)
        }
    };
    var Square = function(game, center, size, color) {
        this.game = game;
        this.center = center;
        this.size = size;
        this.color = color;
        this.originalColor = color;
        this.correct = correct;
    };
    Square.prototype = {
        draw: function(display) {
            drawRect(display, this, this.color);
        },
        collision: function() {
            if (this.correct) this.game.picked(true)
            else this.game.picked(false)
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
        //starting difficulty (lower is harder)
        startingOffset = 150;
        //rate of increasing diffivulty
        difficultySpeed = 0.3;

        colorOffset = Math.ceil(startingOffset * Math.pow(1 + (-difficultySpeed / 10), 10 * (game.player.score / 10)));
        console.log(colorOffset);
        chosen = Math.floor(Math.random() * count + 1);

        color = {
            h: Math.floor(Math.random() * 360),
            s: 100 - Math.floor(Math.random() * (colorOffset/startingOffset)*50),
            l: Math.random() < 0.5 ? 50 - Math.floor(Math.random() * (Math.sqrt(colorOffset)/colorOffset) * 25) : 50 + Math.floor(Math.random() * (Math.sqrt(colorOffset)/colorOffset) * 25)
        };

        otherColor = getOtherColor(color, colorOffset);
        grid = getGrid(count, game);
        sizex = (game.size.x - ((grid.columns - 1) * game.size.x * 0.02) - (game.size.x * 0.15)) / grid.columns;
        sizey = (game.size.y - ((grid.rows - 1) * game.size.x * 0.02) - (game.size.y * 0.25)) / grid.rows;
        size = Math.min(sizex, sizey, game.size.x * 0.2, game.size.y * 0.2);
        bufferx = (game.size.x - (grid.columns * (size + (game.size.x * 0.02)) - (game.size.x * 0.02))) / 2;
        buffery = (game.size.y - (grid.rows * (size + (game.size.x * 0.02)) - (game.size.x * 0.02))) / 2;
        for (var i = 1; i <= count; i++) {
            var x = bufferx + ((i - 1) % grid.columns) * (size + game.size.x * 0.02) + size / 2;
            var y = buffery + Math.floor((i - 1) / grid.columns) * (size + game.size.x * 0.02) + size / 2;
            if (i == chosen) {
                chosenColor = otherColor;
                correct = true;
            }
            else {
                chosenColor = color;
                correct = false;
            }
            squares.push(new Square(game, {x: x, y: y}, {x: size, y: size}, "hsl("+chosenColor.h+","+chosenColor.s+"%,"+chosenColor.l+"%)", correct));
        }
        return squares;
    };
    var getOtherColor = function(color, colorOffset) {
        offsetL = Math.random() < 0.5 ? color.l + colorOffset/5:  color.l - colorOffset/5;
        otherColor = {
            h: color.h,
            s: color.s,
            l: offsetL
        };
        console.log("offsetL: " + offsetL)
        return otherColor;
    };
    var getGrid = function(count, game) {
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

        if (game.size.x/game.size.y >= 1) {
            return {rows: k, columns: j};
        }
        else if (game.size.x/game.size.y < 1) {
            return {rows: j, columns: k};
        }
        
    };
    var Player = function(game) {
        this.game = game;
        this.size = {x: -1,y: -1};
        this.center = {x: 1, y: 1};
        this.score = 0;
        this.best = localStorage.getItem('best') || 0;
        this.input = new Input(this.game);
    };
    Player.prototype = {
        update: function() {
            if (this.input.isTouching()) {
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
            if (this.game.timer !== undefined && this.game.timer.isZero() && !this.game.timer.finished && !this.game.isGameOver) {
                this.game.picked(false);
                this.game.timer.finished = true;
            }
        },
        draw: function(display) {
            //drawRect(display, this);
            display.textAlign = "left";
            scoresize = display.canvas.height / 13.33;
            bestsize = (scoresize * 3) / 8;
            display.fillStyle = "black";
            display.font = scoresize + "px Helvetica"; //  768/12  height/12
            display.fillText(this.game.player.score, scoresize / 4, scoresize);
            display.font = bestsize + "px Helvetica";
            display.fillText("Best: " + this.game.player.best, scoresize / 4, scoresize + bestsize * (5 / 4));
        }
    };
    var Touch = function(game, center) {
        this.game = game;
        this.center = center;
        this.size = {x: -1, y: -1};
    };
    Touch.prototype = {
        draw: function(display) {
            drawRect(display, this, "transparent");
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
        window.addEventListener('mousedown', function(e) {
            e.preventDefault();
            touching = true;
            touchloc = {
                x: e.clientX,
                y: e.clientY,
            };
        });
        window.addEventListener('mouseup', function(e) {
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
    var drawRect = function(display, body, color) {
        color = typeof color !== 'undefined' ? color : "#000000";
        display.fillStyle = color;
        display.fillRect(body.center.x - body.size.x / 2, body.center.y - body.size.y / 2, body.size.x, body.size.y);
    };
    var isColliding = function(b1, b2) {
        return !(b1 === b2 ||
            b1.center.x + b1.size.x / 2 <= b2.center.x - b2.size.x / 2 ||
            b1.center.y + b1.size.y / 2 <= b2.center.y - b2.size.y / 2 ||
            b1.center.x - b1.size.x / 2 >= b2.center.x + b2.size.x / 2 ||
            b1.center.y - b1.size.y / 2 >= b2.center.y + b2.size.y / 2);
    };
    var reportCollisions = function(bodies) {
        j = bodies.length - 1; //player
        for (var i = 0; i < bodies.length-1; i++) {
            if (isColliding(bodies[i], bodies[j]) && bodies[i].collision !== undefined) {
                bodies[i].collision();
            }
        }
    };
    window.addEventListener('load', function() {
        setTimeout(function(){game = new Game()}, 0);
    });
})();
