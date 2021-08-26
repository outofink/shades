export class LocalStore {
  private _best: number;

  constructor() {
    this._best = parseInt(localStorage.getItem('best') || '0');
  }

  public get best(): number {
    return this._best;
  }

  public set best(value: number) {
    this._best = value;
    localStorage.setItem('best', this._best.toString());
  }
}
