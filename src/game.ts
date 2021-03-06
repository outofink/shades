if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').then((registration) => {
      console.log('SW registered: ', registration);
    }).catch((registrationError) => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

import './style.css';

let score = 0;
let best = parseInt(localStorage.getItem('best') || '') || 0;
let oldbest = best - 1;

// on-screen elements
const scoreNum = document.getElementById('score') as HTMLParagraphElement;
const bestNum = document.getElementById('best-score') as HTMLParagraphElement;
const grid = document.getElementById('grid') as HTMLParagraphElement;
const root = document.documentElement as HTMLParagraphElement;

// remove animatation style after the animation is complete
bestNum.onanimationend = () => {
  bestNum.classList.remove('best-animate');
  root.style.setProperty('--old-best', `"${best}"`);
  oldbest = best;
};
scoreNum.onanimationend = () => {
  scoreNum.classList.remove('animate');
  root.style.setProperty('--old', `"${score}"`);
};

// check if using iOS
const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);

// starting difficulty (lower is harder)
const startingOffset = 150;
// rate of increasing difficulty (lower is harder)
const difficultySpeed = 0.97;

function init() : void {
  updatePoints();
  createSquares();
};

function updatePoints() : void {
  root.style.setProperty('--new', `"${score}"`);
  scoreNum.classList.add('animate');

  if (oldbest !== best) {
    root.style.setProperty('--new-best', `"${best}"`);
    bestNum.classList.add('best-animate');
  }
};

function createSquares() : void {
  const count = getCount();
  const dimensions = getGridDimensions(count);

  const [color, otherColor] = genColors();
  const chosen = Math.floor(Math.random() * count);

  clearSquares();

  root.style.setProperty('--x', dimensions.x.toString());
  root.style.setProperty('--y', dimensions.y.toString());

  root.style.setProperty('--color', color);
  root.style.setProperty('--different', otherColor);

  for (let i = 0; i < count; i++) {
    const block = document.createElement('div');

    block.classList.add('box');
    if (iOS) {
      block.addEventListener('touchstart', handleClick, false);
    } else {
      block.addEventListener('click', handleClick, false);
    }

    if (i === chosen) {
      block.classList.add('different');
    }
    grid.appendChild(block);
  }
};

function handleClick(evt: Event) : void {
  evt.preventDefault();
  const target = evt.target as HTMLDivElement;
  const correct = target.classList[1];

  if (!correct) {
    score = 0;
  } else {
    score++;
    if (score > best) {
      best++;
      localStorage.setItem('best', best.toString());
    }
  }
  updatePoints();
  createSquares();
};

function getCount() : number {
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

function getGridDimensions(count: number) : {x: number, y: number} {
  let k = 1;
  let j = count;
  for (const number of [2, 3, 4]) {
    if (count % number === 0 && count / number !== 1) {
      k = number;
      j = count / number;
    }
  }
  [k, j] = [k, j].sort();

  return {x: k, y: j};
};

type Color = {
  h: number;
  s: number;
  l: number
};

function genColors() : [string, string] {
  const colorOffset = Math.ceil(startingOffset * Math.pow(difficultySpeed, score));

  const color : Color = {
    h: Math.floor(Math.random() * 360),
    s: 100 - Math.floor(Math.random() * (colorOffset/startingOffset) * 50),
    l: Math.random() < 0.5 ?
      50 - Math.floor((Math.random() * 25) / Math.sqrt(colorOffset)) :
      50 + Math.floor((Math.random() * 25) / Math.sqrt(colorOffset)),
  };

  const otherColor = getOtherColor(color, colorOffset);

  return [
    `hsl(${color.h},${color.s}%,${color.l}%)`,
    `hsl(${otherColor.h},${otherColor.s}%,${otherColor.l}%)`,
  ];
};

function getOtherColor(color : Color, colorOffset : number) : Color {
  const offsetL = Math.random() < 0.5 ? color.l + colorOffset/5: color.l - colorOffset/5;
  const otherColor = {
    h: color.h,
    s: color.s,
    l: offsetL,
  };
  return otherColor;
};

function clearSquares() : void {
  while (grid.firstChild) {
    grid.removeChild(grid.lastChild as Node);
  }
};

window.onload = () => init();
