import { STARTING_OFFSET, RATE_OF_DIFFICULTY } from './settings';

export class Color {
  h: number;
  s: number;
  l: number;

  constructor(h: number, s: number, l: number) {
    this.h = h;
    this.s = s;
    this.l = l;
  }

  public toCSS(): string {
    return `hsl(${this.h},${this.s}%,${this.l}%)`;
  }
}

export class Colors {
  color: Color;
  otherColor: Color;
  constructor(score: number) {
    [this.color, this.otherColor] = this.genColors(score);
  }
  private genColors(score: number): [Color, Color] {
    const colorOffset = Math.ceil(STARTING_OFFSET * Math.pow(RATE_OF_DIFFICULTY, score));

    const color = new Color(
      Math.floor(Math.random() * 360),
      100 - Math.floor(Math.random() * (colorOffset / STARTING_OFFSET) * 50),
      Math.random() < 0.5
        ? 50 - Math.floor((Math.random() * 25) / Math.sqrt(colorOffset))
        : 50 + Math.floor((Math.random() * 25) / Math.sqrt(colorOffset))
    );

    const otherColor = this.getOtherColor(color, colorOffset);

    return [color, otherColor];
  }

  private getOtherColor(color: Color, colorOffset: number): Color {
    const lightnessOffset = Math.random() < 0.5 ? color.l + colorOffset / 5 : color.l - colorOffset / 5;
    const otherColor = new Color(color.h, color.s, lightnessOffset);
    return otherColor;
  }
}
