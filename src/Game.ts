import { LocalStore } from './LocalStore';
import { GameView } from './GameView';
import { Board } from './Board';

export class Game {
  private _score: number;
  private _best: number;
  private _oldBest: number;
  private gameView: GameView;
  private localStore: LocalStore;
  board: Board;

  constructor() {
    this.localStore = new LocalStore();
    this._score = 0;
    this._best = this.localStore.best;
    this._oldBest = this._best - 1;
    this.gameView = new GameView(this);
    this.board = new Board(this);
  }

  public start() {
    this.board.generateBoard(this);
    this.gameView.updateScore(this);
    this.gameView.updateBest(this);
    this.gameView.renderBoard(this);
  }

  public get best(): number {
    return this._best;
  }

  public set best(value: number) {
    this._best = value;
    this.localStore.best = value;
    this.gameView.updateBest(this);
  }

  public get score(): number {
    return this._score;
  }

  public set score(value: number) {
    this._score = value;
    this.board.generateBoard(this);
    this.gameView.updateScore(this);
    this.gameView.renderBoard(this);
  }

  public get oldBest(): number {
    return this._oldBest;
  }

  public set oldBest(value: number) {
    this._oldBest = value;
  }
}
