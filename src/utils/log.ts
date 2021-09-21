// deno-lint-ignore-file no-explicit-any

export class Logger {
  constructor(
    public name: string,
    public color: (str: string) => string = ((s) => s),
  ) {}

  private printf(data: any[], to: (str: string) => void, prefix = '') {
    const text = data.map((d) => Deno.inspect(d, { colors: true })).join(' ');
    to(this.color(`${prefix}[${this.name}] ${text}`));
  }

  log(...data: any[]) {
    this.printf(data, console.log);
  }

  error(...data: any[]) {
    this.printf(data, console.error, '⚠');
  }
}
