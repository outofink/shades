import { Game } from './Game';
import { Color, Colors } from './Colors';

type Dimensions = {
  x: number;
  y: number;
};

export class Board {
  private colors: Colors;
  private _numberOfSquares: number;
  private _chosen: number;
  private dimensions: Dimensions;

  constructor(game: Game) {
    [this.colors, this._numberOfSquares, this._chosen, this.dimensions] = this.generateBoard(game);
  }

  private getBoardDimensions(numberOfSquares: number): Dimensions {
    let j = numberOfSquares;
    let k = 1;
    for (const i of [2, 3, 4]) {
      if (numberOfSquares % i === 0 && numberOfSquares / i !== 1) {
        j = numberOfSquares / i;
        k = i;
      }
    }
    [j, k] = [j, k].sort();

    return { x: j, y: k };
  }

  private getChosen(numberOfSquares: number): number {
    return Math.floor(Math.random() * numberOfSquares);
  }

  private getNumberOfSquares(game: Game): number {
    if (game.score >= 14) return 20;

    let number = game.score + 3;
    while ([7, 11, 13, 14, 17, 18, 19].includes(number)) {
      number += 1;
    }
    return number;
  }

  public generateBoard(game: Game) {
    this.colors = new Colors(game);
    this._numberOfSquares = this.getNumberOfSquares(game);
    this._chosen = this.getChosen(this._numberOfSquares);
    this.dimensions = this.getBoardDimensions(this._numberOfSquares);

    return [this.colors, this._numberOfSquares, this._chosen, this.dimensions] as const;
  }

  public get color(): Color {
    return this.colors.color;
  }
  public get otherColor(): Color {
    return this.colors.otherColor;
  }

  public get chosen(): number {
    return this._chosen;
  }

  public get numberOfSquares(): number {
    return this._numberOfSquares;
  }

  public get x(): number {
    return this.dimensions.x;
  }
  public get y(): number {
    return this.dimensions.y;
  }
}
