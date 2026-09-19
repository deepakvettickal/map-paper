import type { PatternSpec } from "../config/types";

// Pattern images are identified by their serialised spec, so any style can ask for
// any pattern and it is generated on demand the first time MapLibre needs it.
const PREFIX = "pat:";

export function patternId(p: PatternSpec) {
  return PREFIX + JSON.stringify(p);
}

export function parsePatternId(id: string): PatternSpec | null {
  if (!id.startsWith(PREFIX)) return null;
  try {
    return JSON.parse(id.slice(PREFIX.length));
  } catch {
    return null;
  }
}

/** Small deterministic PRNG so stipple tiles are identical between preview and export. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Renders a seamlessly tileable pattern. Sizes are in CSS px; the image is drawn at 2×. */
export function makePattern(p: PatternSpec): ImageData {
  const k = 2; // pixelRatio of the generated image
  const s = p.spacing;
  const tile = p.type === "stipple" ? s * 6 : p.type === "waves" ? s * 2 : s;
  const size = Math.max(2, Math.round(tile * k));
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = ctx.fillStyle = p.color;
  ctx.lineWidth = (p.width ?? 1) * k;
  ctx.lineCap = "round";
  const S = size;

  const diagonal = (dir: 1 | -1) => {
    ctx.beginPath();
    for (let o = -S; o <= S * 2; o += S) {
      if (dir === 1) {
        ctx.moveTo(o, 0);
        ctx.lineTo(o + S, S);
      } else {
        ctx.moveTo(o + S, 0);
        ctx.lineTo(o, S);
      }
    }
    ctx.stroke();
  };

  switch (p.type) {
    case "hatch":
      diagonal(1);
      break;
    case "cross":
      diagonal(1);
      diagonal(-1);
      break;
    case "lines": {
      ctx.beginPath();
      ctx.moveTo(0, S / 2);
      ctx.lineTo(S, S / 2);
      ctx.stroke();
      break;
    }
    case "dots": {
      const r = (p.width ?? 1) * k;
      for (const [x, y] of [
        [S / 4, S / 4],
        [(3 * S) / 4, (3 * S) / 4],
      ]) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "stipple": {
      const rand = mulberry32(7);
      const r = (p.width ?? 0.8) * k;
      const n = 14;
      for (let i = 0; i < n; i++) {
        const x = rand() * S;
        const y = rand() * S;
        // Draw wrapped copies so dots crossing an edge tile seamlessly.
        for (const dx of [-S, 0, S])
          for (const dy of [-S, 0, S]) {
            ctx.beginPath();
            ctx.arc(x + dx, y + dy, r * (0.6 + rand() * 0.8), 0, Math.PI * 2);
            ctx.fill();
          }
      }
      break;
    }
    case "waves": {
      // Two rows of gentle waves (one full period across the tile), the classic
      // engraved-sea look.
      ctx.beginPath();
      for (const row of [S / 4, (3 * S) / 4]) {
        for (let x = 0; x <= S; x += 1) {
          const y = row + Math.sin((x / S) * Math.PI * 2) * S * 0.08;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
      break;
    }
  }
  return ctx.getImageData(0, 0, size, size);
}
