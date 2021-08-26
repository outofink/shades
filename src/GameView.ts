import { Game } from './Game';

import '../static/style.css';

export class GameView {
  private root: HTMLElement;
  private score: HTMLParagraphElement;
  private best: HTMLParagraphElement;
  private board: HTMLDivElement;

  constructor(game: Game) {
    this.root = document.documentElement;
    this.score = document.getElementById('score') as HTMLParagraphElement;
    this.best = document.getElementById('best-score') as HTMLParagraphElement;
    this.board = document.getElementById('grid') as HTMLDivElement;

    this.initializeAnimations(game);
  }

  private initializeAnimations(game: Game): void {
    this.best.onanimationend = () => {
      this.best.classList.remove('best-animate');
      this.root.style.setProperty('--old-best', `"${game.best}"`);
      game.oldBest = game.best;
    };
    this.score.onanimationend = () => {
      this.score.classList.remove('animate');
      this.root.style.setProperty('--old', `"${game.score}"`);
    };
  }

  public updateScore(game: Game): void {
    this.root.style.setProperty('--new', `"${game.score}"`);
    this.score.classList.add('animate');
  }
  public updateBest(game: Game): void {
    this.root.style.setProperty('--new-best', `"${game.best}"`);
    this.best.classList.add('best-animate');
  }

  public renderBoard(game: Game): void {
    this.clear();

    this.root.style.setProperty('--x', game.board.x.toString());
    this.root.style.setProperty('--y', game.board.y.toString());

    this.root.style.setProperty('--color', game.board.color.toCSS());
    this.root.style.setProperty('--different', game.board.otherColor.toCSS());

    for (let i = 0; i < game.board.numberOfSquares; i++) {
      const square = document.createElement('div');

      square.classList.add('box');
      square.addEventListener(
        this.getHandlerType(),
        (e) => {
          e.preventDefault();
          const target = e.target as HTMLDivElement;
          const correct = target.classList[1];

          if (!correct) {
            game.score = 0;
          } else {
            game.score += 1;
            if (game.score > game.best) {
              game.best += 1;
            }
          }
        },
        false
      );

      if (i === game.board.chosen) {
        square.classList.add('different');
      }
      this.board.appendChild(square);
    }
  }

  private getHandlerType(): string {
    const iOS = /iPad|iPhone|iPod/.test(navigator.platform);
    return iOS ? 'touchstart' : 'click';
  }

  private clear(): void {
    while (this.board?.firstChild) {
      this.board.removeChild(this.board.lastChild as Node);
    }
  }
}
