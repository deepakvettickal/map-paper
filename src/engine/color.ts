/**
 * Colour helpers in OKLCH, a perceptual space: rotating hue or nudging chroma
 * there keeps a palette's contrast relationships intact, which is what makes a
 * randomised style still look designed.
 */

export interface Oklch {
  l: number;
  c: number;
  /** Hue in degrees. */
  h: number;
}

export function hexToOklch(hex: string): Oklch {
  const n = parseInt(hex.replace("#", ""), 16);
  const srgb = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const x = v / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  });
  const [r, g, b] = srgb;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: (Math.atan2(B, A) * 180) / Math.PI };
}

export function oklchToHex({ l, c, h }: Oklch): string {
  const rad = (h * Math.PI) / 180;
  const A = c * Math.cos(rad);
  const B = c * Math.sin(rad);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  const hex = rgb
    .map((v) => {
      const x = Math.max(0, Math.min(1, v));
      const enc = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
      return Math.round(Math.max(0, Math.min(1, enc)) * 255)
        .toString(16)
        .padStart(2, "0");
    })
    .join("");
  return `#${hex}`;
}

/**
 * Shifts one colour: hue rotated by `rotate`, chroma scaled by `chroma`, lightness
 * nudged by `lighten`. Near-neutral colours keep their hue so paper and ink stay put.
 */
export function shiftColor(
  hex: string,
  { rotate = 0, chroma = 1, lighten = 0 }: { rotate?: number; chroma?: number; lighten?: number },
): string {
  const col = hexToOklch(hex);
  const neutral = col.c < 0.02;
  return oklchToHex({
    l: Math.max(0, Math.min(1, col.l + lighten)),
    c: Math.max(0, Math.min(0.37, col.c * chroma)),
    h: neutral ? col.h : col.h + rotate,
  });
}
