import { STARTING_OFFSET, RATE_OF_DIFFICULTY } from './settings';

interface ColorXYZ {
  x: number;
  y: number;
  z: number;
}

interface ColorRGB {
  r: number;
  g: number;
  b: number;
}

export class ColorLAB {
  l: number;
  a: number;
  b: number;

  constructor(l: number, a: number, b: number) {
    this.l = l;
    this.a = a;
    this.b = b;
  }

  public toCSS(): string {
    let colorXYZ = this.LabToXYZ(this);
    let colorRGB = this.XYZToRGB(colorXYZ);
    return `rgb(${colorRGB.r},${colorRGB.g},${colorRGB.b})`;
  }

  private LabToXYZ(color: ColorLAB): ColorXYZ {
    let e = 216 / 24389;
    let k = 24389 / 27;
    let fy = (color.l + 16) / 116;
    let fx = color.a / 500 + fy;
    let fz = fy - color.b / 200;

    let xr = fx ** 3 > e ? fx ** 3 : (116 * fx - 16) / k;
    let yr = color.l > k * e ? Math.pow((color.l + 16) / 116, 3) : color.l / k;
    let zr = fz ** 3 > e ? fz ** 3 : (116 * fz - 16) / k;

    return { x: xr * 95.047, y: yr * 100, z: zr * 108.883 };
  }

  private XYZToRGB(color: ColorXYZ): ColorRGB {
    // Best RGB 
    let r = color.x * 1.7552599 + color.y * -0.4836786 + color.z * -0.2530000;
    let g = color.x * -0.5441336 + color.y * 1.5068789 + color.z * 0.0215528;
    let b = color.x * 0.0063467 + color.y * -0.0175761 + color.z * 1.2256959;

    return { r: Math.floor(r), g: Math.floor(g), b: Math.floor(b) }
  }
}

export class Colors {
  color: ColorLAB;
  otherColor: ColorLAB;
  constructor(score: number) {
    [this.color, this.otherColor] = this.genColors(score);
  }
  private genColors(score: number): [ColorLAB, ColorLAB] {
    const colorOffset = Math.ceil(STARTING_OFFSET * Math.pow(RATE_OF_DIFFICULTY, score));
    console.log("colorOffset: " + colorOffset);
    let color, otherColor;
    do {
      color = new ColorLAB(
        Math.floor(Math.random() * 25) + 75,
        Math.floor(Math.random() * 100) - 50,
        Math.floor(Math.random() * 100) - 50
      );
      otherColor = this.getOtherColor(color, colorOffset);
    } while (color.toCSS().includes("-") || otherColor.toCSS().includes("-"));

    return [color, otherColor];
  }

  private getOtherColor(color: ColorLAB, colorOffset: number): ColorLAB {
    let d = Math.random() < 0.5 ? -colorOffset : colorOffset;

    if (Math.random() < 0.5) {
      return new ColorLAB(color.l, color.a + d, color.b);
    } else {
      return new ColorLAB(color.l, color.a, color.b + d);
    }
  }
}
