;(function() {
    var Game = function() {
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
        this.size2 = {
            x: screen.canvas.width,
            y: screen.canvas.height
        };
        //console.log(this.bodies)
        this.wrongSound = document.getElementById('wrong-sound');
        this.correctSound = document.getElementById('correct-sound');
        this.fired = false;
        this.points = 0;
        this.playsound = 0;
        this.best = localStorage.getItem('best') || 0;
        this.steve = new Player(this);
        this.bodies = createSquares(this).concat(this.steve);
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
            screen.clearRect(0, 0, this.size.x, this.size.y);
            for (var i = 0; i < this.bodies.length; i++) {
                if (this.bodies[i].draw !== undefined) {
                    this.bodies[i].draw(screen);
                }
            }
        },
        // squaresBelow: function(square) {
        //   return this.bodies.filter(function(b) {
        //     return b instanceof Square &&
        //       Math.abs(square.center.x - b.center.x) < b.size.x &&
        //       b.center.y > square.center.y;
        //   }).length > 0;
        // },
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
    var Square = function(game, center, size, color) {
        this.game = game;
        this.center = center;
        this.size = size;
        this.color = color;
        this.correct = correct;
    };
    Square.prototype = {
        update: function() {},
        draw: function(screen) {
            drawRect(screen, this, this.color);
        },
        collision: function() {
            if (this.correct) {
                this.game.points += 1;
                this.game.playsound = 1;
                //this.game.correctSound.load();
                //this.game.correctSound.play();
            } else {
                this.game.points = 0;
                this.game.playsound = -1;
                //this.game.wrongSound.load();
                //this.game.wrongSound.play();
            }
            this.game.bodies = createSquares(this.game).concat(this.game.steve);
        }
    };
    var createSquares = function(game) {
        //console.log(game);
        var squares = [];
        //console.log(game.points);
        if (game.points < 10) {
            count = game.points + 3;
            if (count == 13 || count == 11) {
                count += 1;
            }
        } else {
            count = 20;
        }
        colorOffset = Math.ceil(200 * Math.pow(1 + (-0.5 / 10), 10 * (game.points / 10)));
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
        sizex = (game.size.x - ((grid.columns - 1) * game.size.x * 0.02) - (game.size.x * 0.2)) / grid.columns;
        sizey = (game.size.y - ((grid.rows - 1) * game.size.x * 0.02) - (game.size.y * 0.3)) / grid.rows;
        size = Math.min(sizex, sizey, game.size.x * 0.2, game.size.y * 0.2);
        bufferx = (game.size.x - (grid.columns * (size + game.size.x * 0.02))) / 2;
        buffery = (game.size.y - (grid.rows * (size + game.size.y * 0.02))) / 2;
        for (var i = 1; i <= count; i++) {
            var x = bufferx + ((i - 1) % grid.columns) * (size + game.size.x * 0.02) + size / 2;
            var y = buffery + Math.floor((i - 1) / grid.columns) * (size + game.size.x * 0.02) + size / 2;
            if (i == chosen) {
                chosenColor = hexOtherColor;
                correct = true;
            } else {
                chosenColor = hexColor;
                correct = false;
            }
            squares.push(new Square(game, {x: x, y: y}, {x: size, y: size }, chosenColor, correct));
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
        } else if (otherColor.g < 0 || otherColor.g > 255) {
            return getOtherColor(color, colorOffset);
        } else if (otherColor.b < 0 || otherColor.b > 255) {
            return getOtherColor(color, colorOffset);
        } else {
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
        } else if (count % 3 === 0 && count / 3 > 1) {
            k = 3;
            j = count / 3;
        } else if (count % 2 === 0 && count / 2 > 1) {
            k = 2;
            j = count / 2;
        } else if (count < 10) {
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
        this.keyboarder = new Keyboarder(this.game);
    };
    Player.prototype = {
        update: function() {
            if (this.keyboarder.isTouching()) {
                //console.log(this.keyboarder.touchlocX())
                var touch = new Touch(this.game, {
                    x: this.keyboarder.touchlocX(),
                    y: this.keyboarder.touchlocY()
                }, {
                    x: 0,
                    y: 0
                });
                if (this.game.fired === false) {
                    this.game.addBody(touch);
                    this.game.fired = true;
                }
            }
            if (!this.keyboarder.isTouching()) {
                this.game.fired = false;
            }
            if (this.game.points > this.game.best) {
                this.game.best = this.game.points;
                localStorage.setItem('best', this.game.best);
            }
        },
        draw: function(screen) {
            //drawRect(screen, this);
            scoresize = screen.canvas.height / 10;
            bestsize = (scoresize * 3) / 8;
            screen.fillStyle = "black";
            screen.font = scoresize + "px Arial"; //  768/12  height/12
            screen.fillText(this.game.points, scoresize / 4, scoresize);
            screen.font = bestsize + "px Arial";
            screen.fillText("Best: " + this.game.best, scoresize / 4, scoresize + bestsize * (5 / 4));
        },
        collision: function() {
            //this.game.removeBody(this);
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
        update: function() {},
        draw: function(screen) {
            drawRect(screen, this, "transparent");
        },
        collision: function() {
            this.game.removeBody(this);
        }
    };
    var Keyboarder = function(game) {
        var touching;
        var touchloc = {
            x: 0,
            y: 0
        };
        window.addEventListener('touchstart', function(e) {
            e.preventDefault();
            touching = true;
            touchloc = {
                x: e.touches[0].pageX * window.devicePixelRatio,
                y: e.touches[0].pageY * window.devicePixelRatio
            };

            //console.log(touchloc.x)
        });
        window.addEventListener('touchend', function(e) {
            touching = false;
            if (game.playsound == 1) {
        //game.correctSound.load();
        // if (game.fired) {
          game.correctSound.currentTime=0;
          game.correctSound.play();
          game.playsound=0;
        // }
      }
      else if (game.playsound == -1) {
        //this.game.wrongSound.load();
        // if (game.fired) {
          game.wrongSound.currentTime=0;
          game.wrongSound.play();
          game.playsound=0;
       // }
        }
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
