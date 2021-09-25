export * from 'https://deno.land/std@0.100.0/fmt/colors.ts';

/// Some extensions

/** RGB 8-bits per channel. Each in range `0->255` or `0x00->0xff` */
export interface Rgb {
  r: number;
  g: number;
  b: number;
}

// Lerp color

function lerpInt(from: number, to: number, fraction: number) {
  return Math.trunc(from + (to - from) * fraction);
}
export function lerpColor(from: number, to: number, fraction: number) {
  return (
    (lerpInt((from >> 16) & 0xff, (to >> 16) & 0xff, fraction) << 16) |
    (lerpInt((from >> 8) & 0xff, (to >> 8) & 0xff, fraction) << 8) |
    (lerpInt(from & 0xff, to & 0xff, fraction))
  );
}

// Gradient

export function numberToRgb(color: number | Rgb): Rgb {
  if (typeof color === 'number') {
    return { r: (color >> 16) & 0xff, g: (color >> 8) & 0xff, b: color & 0xff };
  } else {
    return color;
  }
}
export function rgbToNumber(color: number | Rgb): number {
  if (typeof color === 'number') {
    return color;
  } else {
    return (color.r << 16) | (color.g << 8) | (color.b);
  }
}
function clampAndTruncate(component: number) {
  return Math.trunc(Math.max(Math.min(component, 255), 0));
}
function rgb24open(str: string, color: number) { // a little bit optimization; no close
  const open = `\x1b[38;2;${clampAndTruncate((color >> 16) & 0xff)};${
    clampAndTruncate((color >> 8) & 0xff)
  };${clampAndTruncate(color & 0xff)}m`;
  return open + str.replaceAll('\x1b[39m;', open);
}

export function gradient(text: string, colorAt: (fraction: number) => number): string {
  let last = 0xff000000; // is just malformed
  let cache = '';
  let result = '';
  let fractionDenom = text.length - 1;
  if (fractionDenom == 0) fractionDenom = 1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const color = colorAt(i / fractionDenom);
    if (color == last) {
      cache += char;
      continue;
    }

    if (cache.length != 0) {
      result += rgb24open(cache, last);
      cache = '';
    }

    last = color;
  }

  if (cache.length != 0) result += rgb24open(cache, last);
  result += '\x1b[39m;';
  return result;
}

export function gradientLerp(text: string, from: number | Rgb, to: number | Rgb): string {
  const newFrom = rgbToNumber(from);
  const newTo = rgbToNumber(to);

  return gradient(text, (fraction) => lerpColor(newFrom, newTo, fraction));
}
