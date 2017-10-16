var paper;

var W = window.innerWidth;
var H = window.innerHeight;

var score = 0;
var best = localStorage.getItem('best') || 0;

var oldbest = best - 1;

var scoreNum;
var bestNum;
var squares = [];

//starting difficulty (lower is harder)
var startingOffset = 150;
    //rate of increasing difficulty (lower is harder)
var difficultySpeed = .97;

function init() {
	paper = Raphael(0, 0, W, H);
    initPoints();
    createSquares();
};

function initPoints() {
    scoresize = H / 13.33;
    bestsize = (scoresize * 3) / 7;
    bestTxt = paper.text(scoresize / 4, scoresize + bestsize/1.1, "Best:").attr({ 
            "font-size": bestsize,
            "text-anchor": "start", 
            "font-family": "Roboto, sans-serif" 
        });

    scoreNum = paper.text(scoresize / 4, scoresize / 1.5 - .4*scoresize, score).attr({ 
            "font-size": scoresize,
            "text-anchor": "start", 
            "font-family": "Roboto, sans-serif",
            "opacity": 0
        })
        .data("slide", .4*scoresize);

    scoreNum.attr({"transform": "t0,"+2*scoreNum.data("slide")});

    bestNum = paper.text(scoresize / 4 + bestsize * 2.4, scoresize + bestsize/1.1 - .4*bestsize, best).attr({ 
            "font-size": bestsize,
            "text-anchor": "start", 
            "font-family": "Roboto, sans-serif",
            "opacity": 0
        })
        .data("slide", .4*bestsize);
    bestNum.attr({"transform": "t0,"+2*bestNum.data("slide")});
    updatePoints()
};

function animateOut() {
	scoreNum.animate({transform: "t0,-"+scoreNum.data("slide")}, 50, "<")
	        .animate({"opacity": 0}, 50, "<");

    if (best > oldbest) {
		bestNum.animate({transform: "t0,-"+bestNum.data("slide")}, 50, "<")
            .animate({"opacity": 0}, 50, "<");
	};
};

function animateIn() {
    scoreNum.animate({transform: "t0," + 2*scoreNum.data("slide") + "t0,-" + scoreNum.data("slide")}, 50, "<")
            .animate({"opacity": 1}, 50, "<");

    if (best > oldbest) {
        bestNum.animate({transform: "t0," + 2*bestNum.data("slide") + "t0,-" + bestNum.data("slide")}, 50, "<")
            .animate({"opacity": 1}, 50, "<");
        oldbest = best;
    }
};

function updatePoints() {
    animateOut()

    window.setTimeout(function() {
        scoresize = H / 13.33;
        bestsize = (scoresize * 3) / 7;

        scoreNum.attr({"text": score});
        bestNum.attr({"text": best});
        animateIn();    
    }, 50);
};

function createSquares() {
    count = getCount();
    grid = getGrid(count);

    var [size, buffer] = getSizing(grid);

    var [color, otherColor] = genColors();
    var chosen = Math.floor(Math.random() * count + 1);

    clearSquares();
    for (var i = 1; i <= count; i++) {
        var x = buffer.x + ((i - 1) % grid.columns) * (size + W * 0.02) + size / 2;
        var y = buffer.y + Math.floor((i - 1) / grid.columns) * (size + W * 0.02) + size / 2;
        if (i == chosen) {
            chosenColor = otherColor;
            correct = true;
        }
        else {
            chosenColor = color;
            correct = false;
        }
        var [r, g, b] = hsl2rgb(chosenColor.h, chosenColor.s, chosenColor.l);
        var rgb = "rgb("+r+","+g+","+b+")"
        squares.push(genSquare({x: x, y: y}, {x: size, y: size}, rgb, correct));
    } 
};

function getCount() {
    if (score < 18) {
        count = score + 3;
        if ([7, 11, 13, 17, 19].includes(count)) {
            count += 1;
        }
    }
    else {
        count = 20;
    }
    if (count == 14) { // I just don't like the way 14 looks
        count = 15; // Yes, I know hardcoding is evil
    }
    return count
};

function getSizing(grid) {
    sizes = {
        x: (W - ((grid.columns - 1) * W * 0.02) - (W * 0.15)) / grid.columns,
        y: (H - ((grid.rows - 1) * W * 0.02) - (H * 0.25)) / grid.rows
    }
    size = Math.min(sizes.x, sizes.y, W * 0.2, H * 0.2);
    buffer = {
        x: (W - (grid.columns * (size + (W * 0.02)) - (W * 0.02))) / 2,
        y: (H - (grid.rows * (size + (W * 0.02)) - (W * 0.02))) / 2
    }
    return [size, buffer]

};

function genColors() {
    colorOffset = Math.ceil(startingOffset * Math.pow(difficultySpeed, score));

    color = {
        h: Math.floor(Math.random() * 360),
        s: 100 - Math.floor(Math.random() * (colorOffset/startingOffset)*50),
        l: Math.random() < 0.5 ? 50 - Math.floor((Math.random() * 25) / Math.sqrt(colorOffset)) : 50 + Math.floor((Math.random() * 25) / Math.sqrt(colorOffset))
    };

    otherColor = getOtherColor(color, colorOffset);

    return [color, otherColor]
};

function clearSquares() {
    squares.forEach(function(square) {
        square.remove()
    })
    squares.length = 0;
};

function genSquare(center, size, color, correct) {
    rect = paper.rect(center.x - size.x / 2, center.y - size.y / 2, size.x, size.y)
                .attr({
                    fill: Raphael.color(color),
                    "stroke-opacity": 0
                })
                .touchstart(function(e) {
                    answer(correct);
                    updatePoints();
                    createSquares();
                })
    return rect
};

function answer(correct) {
    if (!correct) {
        score = 0;
        return
    }
    score++;
    if (score > best) {
        best++;
        localStorage.setItem('best', best);
    }
};

function getOtherColor(color, colorOffset) {
    offsetL = Math.random() < 0.5 ? color.l + colorOffset/5:  color.l - colorOffset/5;
    otherColor = {
        h: color.h,
        s: color.s,
        l: offsetL
    };
    //console.log("offsetL: " + offsetL)
    return otherColor
};

function hsl2rgb(h, s, l) {
    var m1, m2, hue;
    var r, g, b
    s /= 100;
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
    return [r, g, b];
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
    k = 1;
    j = count;
    [2, 3, 4].forEach(function(number) {
        if (count % number === 0 && count / number !== 1) {
            k = number;
            j = count / number;
        }
    });

    [k, j] = [k, j].sort()

    if (W / H >= 1) {
        return {rows: k, columns: j};
    }
    else {
        return {rows: j, columns: k};
    }
};

window.onload = function() {
    init();
};
