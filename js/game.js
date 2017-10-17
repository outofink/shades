let paper;

const W = window.innerWidth;
const H = window.innerHeight;

let score = 0;
let best = localStorage.getItem('best') || 0;
let oldbest = best - 1;

// on-screen elements
let scoreNum;
let bestNum;

let squares = [];

// text sizes
const scoresize = H / 13.33;
const bestsize = (scoresize * 3) / 7;

//starting difficulty (lower is harder)
const startingOffset = 150;
//rate of increasing difficulty (lower is harder)
const difficultySpeed = 0.97;

//iterator by integer starting with 1
const times = n => f => {
    let iter = i => {
        if (i === n) return;
        f (i+1);
        iter (i + 1);
    };
    return iter (0);
};

let init = () => {
    paper = new Raphael(0, 0, W, H);
    initPoints();
    createSquares();
};

let initPoints = () => {
    paper.text(scoresize / 4, scoresize + bestsize / 1.1, 'Best:').attr({
        'font-size': bestsize,
        'text-anchor': 'start',
        'font-family': 'Roboto, sans-serif'
    });

    scoreNum = paper.text(scoresize / 4, scoresize / 1.5 - 0.4 * scoresize, score).attr({
        'font-size': scoresize,
        'text-anchor': 'start',
        'font-family': 'Roboto, sans-serif',
        'opacity': 0
    })
        .data('slide', 0.4 * scoresize);

    scoreNum.attr({'transform': 't0,'+2*scoreNum.data('slide')});

    bestNum = paper.text(scoresize / 4 + bestsize * 2.4, scoresize + bestsize / 1.1 - 0.4 * bestsize, best).attr({
        'font-size': bestsize,
        'text-anchor': 'start',
        'font-family': 'Roboto, sans-serif',
        'opacity': 0
    })
        .data('slide', 0.4 * bestsize);
    bestNum.attr({'transform': 't0,'+2*bestNum.data('slide')});
    updatePoints();
};

let animateOut = () => {
    scoreNum.animate({transform: 't0,-'+scoreNum.data('slide')}, 50, '<')
        .animate({'opacity': 0}, 50, '<');

    if (best > oldbest) {
        bestNum.animate({transform: 't0,-'+bestNum.data('slide')}, 50, '<')
            .animate({'opacity': 0}, 50, '<');
    }
};

let animateIn = () => {
    scoreNum.animate({transform: 't0,' + 2*scoreNum.data('slide') + 't0,-' + scoreNum.data('slide')}, 50, '<')
        .animate({'opacity': 1}, 50, '<');

    if (best > oldbest) {
        bestNum.animate({transform: 't0,' + 2*bestNum.data('slide') + 't0,-' + bestNum.data('slide')}, 50, '<')
            .animate({'opacity': 1}, 50, '<');
        oldbest = best;
    }
};

let updatePoints = () => {
    animateOut();

    window.setTimeout(() => {
        scoreNum.attr({'text': score});
        bestNum.attr({'text': best});
        animateIn();
    }, 50);
};

let createSquares = () => {
    let count = getCount();
    let grid = getGrid(count);

    let [size, buffer] = getSizing(grid);

    let [color, otherColor] = genColors();
    let chosen = Math.floor(Math.random() * count + 1);

    let chosenColor, correct;

    clearSquares();
    times(count) (i => {
        let x = buffer.x + ((i - 1) % grid.columns) * (size + W * 0.02) + size / 2;
        let y = buffer.y + Math.floor((i - 1) / grid.columns) * (size + W * 0.02) + size / 2;
        if (i == chosen) {
            chosenColor = otherColor;
            correct = true;
        }
        else {
            chosenColor = color;
            correct = false;
        }
        let [r, g, b] = hsl2rgb(chosenColor.h, chosenColor.s, chosenColor.l);
        let rgb = 'rgb('+r+','+g+','+b+')';
        squares.push(genSquare({x: x, y: y}, {x: size, y: size}, rgb, correct));
    });
};

let getCount = () => {
    let count;
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
    return count;
};

let getSizing = (grid) => {
    let sizes = {
        x: (W - ((grid.columns - 1) * W * 0.02) - (W * 0.15)) / grid.columns,
        y: (H - ((grid.rows - 1) * W * 0.02) - (H * 0.25)) / grid.rows
    };
    let size = Math.min(sizes.x, sizes.y, W * 0.2, H * 0.2);
    let buffer = {
        x: (W - (grid.columns * (size + (W * 0.02)) - (W * 0.02))) / 2,
        y: (H - (grid.rows * (size + (W * 0.02)) - (W * 0.02))) / 2
    };
    return [size, buffer];

};

let genColors = () => {
    let colorOffset = Math.ceil(startingOffset * Math.pow(difficultySpeed, score));

    let color = {
        h: Math.floor(Math.random() * 360),
        s: 100 - Math.floor(Math.random() * (colorOffset/startingOffset) * 50),
        l: Math.random() < 0.5 
            ? 50 - Math.floor((Math.random() * 25) / Math.sqrt(colorOffset))
            : 50 + Math.floor((Math.random() * 25) / Math.sqrt(colorOffset))
    };

    let otherColor = getOtherColor(color, colorOffset);

    return [color, otherColor];
};

let clearSquares = () => {
    squares.forEach(square => square.remove());
    squares.length = 0;
};

let genSquare = (center, size, color, correct) => {
    let rect = paper.rect(center.x - size.x / 2, center.y - size.y / 2, size.x, size.y)
        .attr({
            fill: color,
            'stroke-opacity': 0
        })
        .touchstart(() => {
            answer(correct);
            updatePoints();
            createSquares();
        });
    return rect;
};

let answer = correct => {
    if (!correct) {
        score = 0;
        return;
    }
    score++;
    if (score > best) {
        best++;
        localStorage.setItem('best', best);
    }
};

let getOtherColor = (color, colorOffset) => {
    let offsetL = Math.random() < 0.5 ? color.l + colorOffset/5:    color.l - colorOffset/5;
    let otherColor = {
        h: color.h,
        s: color.s,
        l: offsetL
    };
    //console.log('offsetL: ' + offsetL)
    return otherColor;
};

let hsl2rgb = (h, s, l) => {
    let m1, m2, hue;
    let r, g, b;
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

let HueToRgb = (m1, m2, hue) => {
    let v;
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

let getGrid = count => {
    let k = 1;
    let j = count;
    for (let number of [2, 3, 4]) {
        if (count % number === 0 && count / number !== 1) {
            k = number;
            j = count / number;
        }
    }
    [k, j] = [k, j].sort();

    if (W / H >= 1) {
        return {rows: k, columns: j};
    }
    else {
        return {rows: j, columns: k};
    }
};

window.onload = () => init();
