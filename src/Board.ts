import { ColorLAB, Colors } from './Colors';

type Dimensions = {
  x: number;
  y: number;
};

export class Board {
  private _colors: Colors;
  private _numberOfSquares: number;
  private _chosen: number;
  private _dimensions: Dimensions;

  constructor() {
    this._colors = new Colors(0);
    this._numberOfSquares = this.getNumberOfSquares(0);
    this._chosen = this.getChosen(this.numberOfSquares);
    this._dimensions = this.getBoardDimensions(this.numberOfSquares);
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
  }

  public get color(): ColorLAB {
    return this._colors.color;
  }
  public get otherColor(): ColorLAB {
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
