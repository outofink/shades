import { LocalStore } from './LocalStore';
import { GameView } from './GameView';
import { Board } from './Board';

export class Game {
  private _score: number;
  private _best: number;
  private gameView: GameView;
  private localStore: LocalStore;
  board: Board;

  constructor() {
    this.localStore = new LocalStore();
    this._score = 0;
    this._best = this.localStore.best;
    this.gameView = new GameView();
    this.board = new Board();
  }

  public start() {
    this.gameView.updateScore(this.score);
    this.gameView.updateBest(this.best);
    this.gameView.renderBoard(this.board);
    this.addEventListeners();
  }

  private addEventListeners() {
    const squares = document.getElementById('grid')?.childNodes as NodeListOf<HTMLDivElement>;

    squares.forEach(square =>
      square.addEventListener(
        this.gameView.getHandlerType(),
        (e) => {
          e.preventDefault();
          const target = e.target as HTMLDivElement;
          const correct = target.classList[1];

          if (!correct) {
            this.score = 0;
          } else {
            this.score += 1;
            if (this.score > this.best) {
              this.best += 1;
            }
          }
        },
        false
      )
    );
  }

  public get best(): number {
    return this._best;
  }

  public set best(value: number) {
    this._best = value;
    this.localStore.best = value;
    this.gameView.updateBest(this.best);
  }

  public get score(): number {
    return this._score;
  }

  public set score(value: number) {
    this._score = value;
    this.board.generateBoard(this.score);
    this.gameView.updateScore(this.score);
    this.gameView.renderBoard(this.board);
    this.addEventListeners();
  }
}
