import { Color, Colors } from './Colors';

type Dimensions = {
  x: number;
  y: number;
};

export class Board {
  private _colors: Colors;
  private _numberOfSquares: number;
  private _chosen: number;
  private _dimensions: Dimensions;

  constructor(score: number) {
    [this._colors, this._numberOfSquares, this._chosen, this._dimensions] = this.generateBoard(score);
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

  private getNumberOfSquares(score: number): number {
    if (score >= 14) return 20;

    let number = score + 3;
    while ([7, 11, 13, 14, 17, 18, 19].includes(number)) {
      number += 1;
    }
    return number;
  }

  public generateBoard(score: number) {
    this._colors = new Colors(score);
    this._numberOfSquares = this.getNumberOfSquares(score);
    this._chosen = this.getChosen(this.numberOfSquares);
    this._dimensions = this.getBoardDimensions(this.numberOfSquares);

    return [this._colors, this.numberOfSquares, this.chosen, this._dimensions] as const;
  }

  public get color(): Color {
    return this._colors.color;
  }
  public get otherColor(): Color {
    return this._colors.otherColor;
  }

  public get chosen(): number {
    return this._chosen;
  }

  public get numberOfSquares(): number {
    return this._numberOfSquares;
  }

  public get x(): number {
    return this._dimensions.x;
  }
  public get y(): number {
    return this._dimensions.y;
  }
}
