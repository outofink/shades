var paper;

var W = window.innerWidth;
var H = window.innerHeight;

var dim= {
	x: W,
	y: H
};

var isAnswered = false;
var answer;
var score = 0;
var best = localStorage.getItem('best') || 0;
var initBest = true
//var best = 0;
var beat = false;

function init() {
	paper = Raphael(0, 0, W, H);

	var tick = function() {
            if (isAnswered) {
				if (answer == true) {
					score++;
					if (score > best) {
						beat = true
                		best++;
                		localStorage.setItem('best', best);
            		}
					animateOut()
					createSquares();
				}
				else {
					score = 0;
					animateOut();
					createSquares();
					beat = false;
				}
			}
			isAnswered = false;
            requestAnimationFrame(tick);
    };
    tick();

	createSquares();
	initPoints();
};
function animateOut() {
	paper.forEach(function (el) {
		if (el.data("type") == "square") {
			el.animate({x: el.attr("x")+el.data("slide")}, 100, "<")
			  .animate({"fill-opacity": 0}, 100, "<", function() {el.remove();})
			  .data("type", "dead");
		};
		if (el.data("type") == "number") {
			el.animate({y: el.attr("y")-el.data("slide")}, 100, "<")
			  .animate({"opacity": 0}, 100, "<", function() {el.remove();})
			  .data("type", "dead");
		};
		if (el.data("type") == "best" && score == best && beat) {
			el.animate({y: el.attr("y")-el.data("slide")}, 100, "<")
			  .animate({"opacity": 0}, 100, "<", function() {el.remove();})
			  .data("type", "dead");
		};
	});
};
function Square(center, size, color, correct) {
	rect = paper.rect(center.x - size.x / 2 - .611*size.x, center.y - size.y / 2, size.x, size.y)
				.attr({
					fill: Raphael.color(color),
					"stroke-opacity": 0
				})
				.data("type", "square")
				.data("slide", .611*size.x)
				.touchstart(function(e) {
					isAnswered = true;
					answer = correct;
				})
                .click(function(e) {
                    isAnswered = true;
                    answer = correct;
                })
				.attr({"fill-opacity":0});
};
function drawPoints() {
	scoresize = dim.y / 13.33;
    bestsize = (scoresize * 3) / 7;
	scoreNum = paper.text(scoresize / 4, scoresize / 1.5 + .4*scoresize, score).attr({ 
			"font-size": scoresize,
			"text-anchor": "start", 
			"font-family": "Roboto, sans-serif",
			"opacity": 0
		})
		.data("type", "number")
		.data("slide", .4*scoresize)
		.data("value", score);
	bestNum = paper.text(scoresize / 4 + bestsize * 2.4, scoresize + bestsize/1.1 + .4*best, best).attr({ 
			"font-size": bestsize,
			"text-anchor": "start", 
			"font-family": "Roboto, sans-serif",
			"opacity": 0
		})
	    .data("type", "best")
		.data("slide", .4*best)
		.data("value", score);
};
function initPoints() {
	scoresize = dim.y / 13.33;
    bestsize = (scoresize * 3) / 7;
	bestTxt = paper.text(scoresize / 4, scoresize + bestsize/1.1, "Best:").attr({ 
			"font-size": bestsize,
			"text-anchor": "start", 
			"font-family": "Roboto, Pacifico, sans-serif" 
		});
};
function createSquares() {
    var squares = [];
    if (score < 10) {
        count = score + 3;
        if (count == 13 || count == 11) {
            count += 1;
        }
    } 
    else count = 20;
    //starting difficulty (lower is harder)
    startingOffset = 150;
    //rate of increasing diffivulty
    difficultySpeed = 0.3;

    colorOffset = Math.ceil(startingOffset * Math.pow(1 + (-difficultySpeed / 10), 10 * (score / 10)));
    console.log(colorOffset);
    chosen = Math.floor(Math.random() * count + 1);

    color = {
        h: Math.floor(Math.random() * 360),
        s: 100 - Math.floor(Math.random() * (colorOffset/startingOffset)*50),
        l: Math.random() < 0.5 ? 50 - Math.floor(Math.random() * (Math.sqrt(colorOffset)/colorOffset) * 25) : 50 + Math.floor(Math.random() * (Math.sqrt(colorOffset)/colorOffset) * 25)
    };

    otherColor = getOtherColor(color, colorOffset);
    grid = getGrid(count);
    sizex = (dim.x - ((grid.columns - 1) * dim.x * 0.02) - (dim.x * 0.15)) / grid.columns;
    sizey = (dim.y - ((grid.rows - 1) * dim.x * 0.02) - (dim.y * 0.25)) / grid.rows;
    size = Math.min(sizex, sizey, dim.x * 0.2, dim.y * 0.2);
    bufferx = (dim.x - (grid.columns * (size + (dim.x * 0.02)) - (dim.x * 0.02))) / 2;
    buffery = (dim.y - (grid.rows * (size + (dim.x * 0.02)) - (dim.x * 0.02))) / 2;
    for (var i = 1; i <= count; i++) {
        var x = bufferx + ((i - 1) % grid.columns) * (size + dim.x * 0.02) + size / 2;
        var y = buffery + Math.floor((i - 1) / grid.columns) * (size + dim.x * 0.02) + size / 2;
        if (i == chosen) {
            chosenColor = otherColor;
            correct = true;
        }
        else {
            chosenColor = color;
            correct = false;
        }
        rgb = hsl2rgb(chosenColor.h, chosenColor.s, chosenColor.l);
        squares.push(new Square({x: x, y: y}, {x: size, y: size}, "rgb("+rgb.r+","+rgb.g+","+rgb.b+")", correct));
    };
    drawPoints();
    window.setTimeout(function() {
		paper.forEach(function (el) {
			if (el.data("type") == "square") {
				el.animate({x: el.attr("x")+el.data("slide")}, 100, "<")
				  .animate({"fill-opacity": 1}, 100, "<")
			}
			if (el.data("type") == "number") {
				el.animate({y: el.attr("y")-el.data("slide")}, 100, "<")
				  .animate({"opacity": 1}, 100, "<")
			}
			if (el.data("type") == "best" && ((score == best && beat) || initBest)) {
				el.animate({y: el.attr("y")-el.data("slide")}, 100, "<")
				  .animate({"opacity": 1}, 100, "<");
				initBest = false
			};
		});
	}, 100);
};
function getOtherColor(color, colorOffset) {
    offsetL = Math.random() < 0.5 ? color.l + colorOffset/5:  color.l - colorOffset/5;
    otherColor = {
        h: color.h,
        s: color.s,
        l: offsetL
    };
    console.log("offsetL: " + offsetL)
    return otherColor;
};
function hsl2rgb(h, s, l) {
    var m1, m2, hue;
    var r, g, b
    s /=100;
    l /= 100;
    if (s == 0)
        r = g = b = (l * 255);
    else {
        if (l <= 0.5)
            m2 = l * (s + 1);
        else
            m2 = l + s - l * s;
        m1 = l * 2 - m2;
        hue = h / 360;
        r = Math.round(HueToRgb(m1, m2, hue + 1/3));
        g = Math.round(HueToRgb(m1, m2, hue));
        b = Math.round(HueToRgb(m1, m2, hue - 1/3));
    }
    return {r: r, g: g, b: b};
};
function HueToRgb(m1, m2, hue) {
    var v;
    if (hue < 0)
        hue += 1;
    else if (hue > 1)
        hue -= 1;

    if (6 * hue < 1)
        v = m1 + (m2 - m1) * hue * 6;
    else if (2 * hue < 1)
        v = m2;
    else if (3 * hue < 2)
        v = m1 + (m2 - m1) * (2/3 - hue) * 6;
    else
        v = m1;

    return 255 * v;
};
function getGrid(count) {
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

    if (dim.x/dim.y >= 1) {
        return {rows: k, columns: j};
    }
    else if (dim.x/dim.y < 1) {
        return {rows: j, columns: k};
    }
};
window.onload = function() {
    init();
};