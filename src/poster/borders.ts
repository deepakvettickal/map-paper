import type { StyleSpec } from "../config/types";

/**
 * Border treatments, drawn as a band of `frame` colour around the map with a
 * different finish on the inner edge. Kept to five: a plain band, a double rule,
 * a gallery mat, drafting corner ticks, and a stepped deco frame.
 */
export const BORDERS = ["plain", "double", "mat", "ticks", "deco"] as const;
export type BorderType = (typeof BORDERS)[number];

export const BORDER_LABELS: Record<BorderType, string> = {
  plain: "Plain band",
  double: "Double rule",
  mat: "Gallery mat",
  ticks: "Corner ticks",
  deco: "Deco steps",
};

/**
 * Draws the border band. `f` is the band thickness in pixels and `u` is 1% of the
 * poster's shorter side, so every rule scales with the poster.
 */
export function drawBorder(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  spec: StyleSpec,
  type: BorderType,
  f: number,
  u: number,
) {
  const c = spec.colors;
  if (f <= 0) return;

  // The band itself: four rectangles around the map area.
  ctx.fillStyle = c.frame;
  ctx.fillRect(0, 0, w, f);
  ctx.fillRect(0, h - f, w, f);
  ctx.fillRect(0, 0, f, h);
  ctx.fillRect(w - f, 0, f, h);

  // Rules use the text colour: several styles set `outline` to the land colour to
  // suppress building outlines, which would leave the border invisible.
  const ink = c.text;
  ctx.strokeStyle = ink;
  ctx.lineJoin = "miter";
  const hair = Math.max(1, 0.12 * u);

  switch (type) {
    case "plain":
      ctx.lineWidth = hair * 1.25;
      ctx.strokeRect(f, f, w - 2 * f, h - 2 * f);
      break;

    case "double": {
      // A heavier rule on the map edge and a lighter one out in the band.
      const gap = Math.min(f * 0.45, 1.6 * u);
      ctx.lineWidth = hair * 2;
      ctx.strokeRect(f, f, w - 2 * f, h - 2 * f);
      ctx.lineWidth = hair;
      ctx.strokeRect(f - gap, f - gap, w - 2 * (f - gap), h - 2 * (f - gap));
      break;
    }

    case "mat": {
      // Bevelled cut like a picture mount: a light chamfer, then a hairline.
      const bevel = Math.min(f * 0.35, 1.2 * u);
      ctx.save();
      ctx.globalAlpha = 0.5;
      ctx.strokeStyle = c.land;
      ctx.lineWidth = bevel;
      ctx.strokeRect(f + bevel / 2, f + bevel / 2, w - 2 * f - bevel, h - 2 * f - bevel);
      ctx.restore();
      ctx.lineWidth = hair;
      ctx.strokeRect(f, f, w - 2 * f, h - 2 * f);
      break;
    }

    case "ticks": {
      // Drafting crop marks: a hairline frame with ticks reaching into the band.
      const len = Math.min(f * 0.8, 3 * u);
      ctx.lineWidth = hair;
      ctx.strokeRect(f, f, w - 2 * f, h - 2 * f);
      ctx.beginPath();
      for (const [x, y, dx, dy] of [
        [f, f, 1, 1],
        [w - f, f, -1, 1],
        [f, h - f, 1, -1],
        [w - f, h - f, -1, -1],
      ] as const) {
        ctx.moveTo(x - dx * len, y);
        ctx.lineTo(x + dx * len * 0.35, y);
        ctx.moveTo(x, y - dy * len);
        ctx.lineTo(x, y + dy * len * 0.35);
      }
      ctx.stroke();
      break;
    }

    case "deco": {
      // Stepped corners: three nested rules, each stopping short of the last.
      const step = Math.min(f * 0.3, 1.1 * u);
      ctx.lineWidth = hair * 2;
      ctx.strokeRect(f, f, w - 2 * f, h - 2 * f);
      ctx.lineWidth = hair;
      for (const i of [1, 2]) {
        const o = f - i * step;
        if (o <= 0) break;
        ctx.strokeRect(o, o, w - 2 * o, h - 2 * o);
      }
      // Corner blocks give the stepped, Deco feel.
      ctx.fillStyle = ink;
      const block = Math.min(f * 0.55, 1.8 * u);
      for (const [x, y] of [
        [f, f],
        [w - f - block, f],
        [f, h - f - block],
        [w - f - block, h - f - block],
      ] as const) {
        ctx.fillRect(x, y, block, block);
      }
      break;
    }
  }
}
