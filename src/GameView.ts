import { Board } from './Board';

import './style.css';

export class GameView {
  private root: HTMLElement;
  private score: HTMLParagraphElement;
  private best: HTMLParagraphElement;
  private board: HTMLDivElement;

  constructor() {
    this.root = document.documentElement;
    this.score = document.getElementById('score') as HTMLParagraphElement;
    this.best = document.getElementById('best-score') as HTMLParagraphElement;
    this.board = document.getElementById('grid') as HTMLDivElement;
  }

  public updateScore(score: number): void {
    this.score.onanimationend = () => {
      this.score.classList.remove('animate');
      this.root.style.setProperty('--old', `"${score}"`);
    };
    this.root.style.setProperty('--new', `"${score}"`);
    this.score.classList.add('animate');
  }

  public updateBest(best: number): void {
    this.best.onanimationend = () => {
      this.best.classList.remove('best-animate');
      this.root.style.setProperty('--old-best', `"${best}"`);
    };
    this.root.style.setProperty('--new-best', `"${best}"`);
    this.best.classList.add('best-animate');
  }

  public renderBoard(board: Board): void {
    this.clear();

    this.root.style.setProperty('--x', board.x.toString());
    this.root.style.setProperty('--y', board.y.toString());

    this.root.style.setProperty('--color', board.color.toCSS());
    this.root.style.setProperty('--different', board.otherColor.toCSS());

    for (let i = 0; i < board.numberOfSquares; i++) {
      const square = document.createElement('div');

      square.classList.add('box');

      if (i === board.chosen) {
        square.classList.add('different');
      }
      this.board.appendChild(square);
    }
  }

  public getHandlerType(): string {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    return iOS ? 'touchstart' : 'click';
  }

  private clear(): void {
    while (this.board?.firstChild) {
      this.board.removeChild(this.board.lastChild as Node);
    }
  }
}
