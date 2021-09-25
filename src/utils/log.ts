// deno-lint-ignore-file no-explicit-any
import { gradientLerp, Rgb, rgb24 } from '/deps/color.ts';

//////// Colors

const sErrorColor = 0xee5533;

////////

export class Logger {
  constructor(
    public name: string,
    public color: number | Rgb,
  ) {}

  printf(
    data: any[],
    to: (str: string) => void,
    color: (text: string) => string = (t) => rgb24(t, this.color),
    prefix = '',
  ) {
    const text = data.map((d) => Deno.inspect(d, { colors: true })).join(' ');
    to(color(`${prefix}[${this.name}] ${text}`));
  }

  log(...data: any[]) {
    this.printf(data, console.log);
  }

  error(...data: any[]) {
    this.printf(data, console.error, (t) => gradientLerp(t, this.color, sErrorColor), '⚠');
  }
}
