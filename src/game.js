import offlinePluginRuntime from 'offline-plugin/runtime';
offlinePluginRuntime.install();

const style = document.createElement('style');
style.innerHTML = 'body { overscroll-behavior: contain;}';
const ref = document.querySelector('script');
ref.parentNode.insertBefore(style, ref);

import Raphael from 'raphael';

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

// check if using iOS
const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

// text sizes
const scoresize = H / 13.33;
const bestsize = (scoresize * 3) / 7;

// starting difficulty (lower is harder)
const startingOffset = 150;
// rate of increasing difficulty (lower is harder)
const difficultySpeed = 0.97;

// iterator by integer starting with 1
const times = (n) => (f) => {
    const iter = (i) => {
        if (i === n) return;
        f(i+1);
        iter(i + 1);
    };
    return iter(0);
};

const init = () => {
    paper = new Raphael(0, 0, W, H);
    initPoints();
    createSquares();
};

const initPoints = () => {
    paper.text(scoresize / 4, scoresize + bestsize / 1.1, 'Best:').attr({
        'font-size': bestsize,
        'text-anchor': 'start',
        'font-family': 'sans-serif',
    });

    scoreNum = paper.text(scoresize / 4, scoresize / 1.5 - 0.4 * scoresize, score).attr({
        'font-size': scoresize,
        'text-anchor': 'start',
        'font-family': 'sans-serif',
        'opacity': 0,
    });
    scoreNum.attr({'transform': `t0,${0.8 * scoresize}`});

    bestNum = paper.text(scoresize / 4 + bestsize * 2.34, scoresize + bestsize / 1.1 - 0.4 * bestsize, best).attr({
        'font-size': bestsize,
        'text-anchor': 'start',
        'font-family': 'sans-serif',
        'opacity': 0,
    });
    bestNum.attr({'transform': `t0,${0.8 * bestsize}`});
    updatePoints();
};

const animateOut = () => {
    scoreNum.animate({transform: `t0,-${0.4 * scoresize}`}, 50, '<')
        .animate({'opacity': 0}, 50, '<');

    if (best > oldbest) {
        bestNum.animate({transform: `t0,-${0.4 * bestsize}`}, 50, '<')
            .animate({'opacity': 0}, 50, '<');
    }
};

const animateIn = () => {
    scoreNum.animate({transform: `t0,${0.8 * scoresize}t0,-${0.4 * scoresize}`}, 50, '<')
        .animate({'opacity': 1}, 50, '<');

    if (best > oldbest) {
        bestNum.animate({transform: `t0,${0.8 * bestsize}t0,-${0.4 * bestsize}`}, 50, '<')
            .animate({'opacity': 1}, 50, '<');
        oldbest = best;
    }
};

const updatePoints = () => {
    animateOut();

    window.setTimeout(() => {
        scoreNum.attr({'text': score});
        bestNum.attr({'text': best});
        animateIn();
    }, 50);
};

const createSquares = () => {
    const count = getCount();
    const grid = getGrid(count);

    const [size, buffer] = getSizing(grid);

    const [color, otherColor] = genColors();
    const chosen = Math.floor(Math.random() * count + 1);

    let chosenColor; let correct;

    clearSquares();
    times(count)((i) => {
        const x = buffer.x + ((i - 1) % grid.columns) * (size + W * 0.02) + size / 2;
        const y = buffer.y + Math.floor((i - 1) / grid.columns) * (size + W * 0.02) + size / 2;
        if (i == chosen) {
            chosenColor = otherColor;
            correct = true;
        } else {
            chosenColor = color;
            correct = false;
        }
        const rgb = Raphael.hsl(chosenColor.h, chosenColor.s, chosenColor.l);
        squares.push(genSquare({x: x, y: y}, {x: size, y: size}, rgb, correct));
    });
};

const getCount = () => {
    let count;
    if (score >= 14) {
        return 20;
    }
    count = score + 3;
    while ([7, 11, 13, 14, 17, 18, 19].includes(count)) {
        count += 1;
    }
    return count;
};

const getSizing = (grid) => {
    const sizes = {
        x: (W - ((grid.columns - 1) * W * 0.02) - (W * 0.15)) / grid.columns,
        y: (H - ((grid.rows - 1) * W * 0.02) - (H * 0.25)) / grid.rows,
    };
    const size = Math.min(sizes.x, sizes.y, W * 0.2, H * 0.2);
    const buffer = {
        x: (W - (grid.columns * (size + (W * 0.02)) - (W * 0.02))) / 2,
        y: (H - (grid.rows * (size + (W * 0.02)) - (W * 0.02))) / 2,
    };
    return [size, buffer];
};

const genColors = () => {
    const colorOffset = Math.ceil(startingOffset * Math.pow(difficultySpeed, score));

    const color = {
        h: Math.floor(Math.random() * 360),
        s: 100 - Math.floor(Math.random() * (colorOffset/startingOffset) * 50),
        l: Math.random() < 0.5 ?
            50 - Math.floor((Math.random() * 25) / Math.sqrt(colorOffset)) :
            50 + Math.floor((Math.random() * 25) / Math.sqrt(colorOffset)),
    };

    const otherColor = getOtherColor(color, colorOffset);

    return [color, otherColor];
};

const clearSquares = () => {
    squares.forEach((square) => square.remove());
    squares = [];
};

const genSquare = (center, size, color, correct) => {
    const rect = paper.rect(center.x - size.x / 2, center.y - size.y / 2, size.x, size.y)
        .attr({
            'fill': color,
            'stroke-opacity': 0,
        });
    if (iOS) {
        rect.touchstart(() => {
            answer(correct);
            updatePoints();
            createSquares();
        });
    } else {
        rect.mousedown(() => {
            answer(correct);
            updatePoints();
            createSquares();
        });
    }
    return rect;
};

const answer = (correct) => {
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

const getOtherColor = (color, colorOffset) => {
    const offsetL = Math.random() < 0.5 ? color.l + colorOffset/5: color.l - colorOffset/5;
    const otherColor = {
        h: color.h,
        s: color.s,
        l: offsetL,
    };
    return otherColor;
};

const getGrid = (count) => {
    let k = 1;
    let j = count;
    for (const number of [2, 3, 4]) {
        if (count % number === 0 && count / number !== 1) {
            k = number;
            j = count / number;
        }
    }
    [k, j] = [k, j].sort();

    if (W / H >= 1) {
        return {rows: k, columns: j};
    } else {
        return {rows: j, columns: k};
    }
};

window.onload = () => init();
