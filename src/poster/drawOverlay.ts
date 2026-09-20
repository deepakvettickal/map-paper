import type { StyleSpec } from "../config/types";

export interface OverlayText {
  title: string;
  subtitle: string;
  coords: string | null;
  /** Hide the title block entirely (the credit note always stays). */
  show: boolean;
  /** Multiplier for the title block's text size. */
  scale: number;
}

export const CREDIT = "data © OpenStreetMap contributors · tiles OpenFreeMap";

/**
 * Draws the poster frame and text onto a canvas of size w×h.
 * All measurements are fractions of the poster's shorter side, so the live preview and
 * the high-DPI export produce the same composition at any resolution.
 */
export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  spec: StyleSpec,
  text: OverlayText,
) {
  const c = spec.colors;
  const u = Math.min(w, h) / 100; // 1 unit = 1% of the shorter side

  const f = spec.frameWidth * Math.min(w, h);

  if (spec.grid) {
    const step = spec.grid.spacing * u;
    ctx.save();
    ctx.globalAlpha = spec.grid.opacity;
    ctx.strokeStyle = spec.grid.color;
    ctx.lineWidth = Math.max(1, 0.08 * u);
    ctx.beginPath();
    for (let x = f + step; x < w - f; x += step) {
      ctx.moveTo(x, f);
      ctx.lineTo(x, h - f);
    }
    for (let y = f + step; y < h - f; y += step) {
      ctx.moveTo(f, y);
      ctx.lineTo(w - f, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Frame: fill the border band around the edge.
  ctx.fillStyle = c.frame;
  ctx.fillRect(0, 0, w, f);
  ctx.fillRect(0, h - f, w, f);
  ctx.fillRect(0, 0, f, h);
  ctx.fillRect(w - f, 0, f, h);
  ctx.strokeStyle = c.outline;
  ctx.lineWidth = Math.max(1, 0.15 * u);
  ctx.strokeRect(f, f, w - 2 * f, h - 2 * f);

  // Title block lines, bottom-up layout computed first so a text panel can fit around it.
  const k = text.scale;
  const lines: { text: string; font: string; size: number }[] = [];
  if (text.show) {
    if (text.title) lines.push({ text: text.title, font: spec.fonts.title, size: 5.2 * u * k });
    if (text.subtitle) lines.push({ text: text.subtitle, font: spec.fonts.title, size: 3.6 * u * k });
    if (text.coords) lines.push({ text: text.coords, font: spec.fonts.subtitle, size: 1.8 * u * k });
  }
  const gapAbove = (i: number) =>
    lines[i].size * (i > 0 && lines[i - 1].font === spec.fonts.title ? 1.5 : 1.35);
  // Distance from the last baseline up to the top of the first line's capitals.
  let blockHeight = lines.length ? lines[0].size * 0.8 : 0;
  for (let i = 1; i < lines.length; i++) blockHeight += gapAbove(i);

  // The panel hugs the text: a fixed height would leave a huge band on wide posters.
  const pad = 3.5 * u * Math.min(1, k);
  const panel = lines.length && spec.textPanel ? blockHeight + pad * 2 : 0;
  if (panel) {
    ctx.fillStyle = c.frame;
    ctx.fillRect(f, h - f - panel, w - 2 * f, panel);
    ctx.strokeStyle = c.outline;
    ctx.lineWidth = Math.max(1, 0.15 * u);
    ctx.beginPath();
    ctx.moveTo(f, h - f - panel);
    ctx.lineTo(w - f, h - f - panel);
    ctx.stroke();
  }

  // Credit note: tiny, bottom-right corner inside the frame.
  const noteSize = 0.9 * u;
  ctx.font = `${noteSize}px "${spec.fonts.subtitle}"`;
  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  drawHaloText(ctx, CREDIT, w - f - 1.2 * u, h - f - 1.2 * u, noteSize * 0.45, panel ? c.frame : c.land, c.text);

  if (!lines.length) return;

  ctx.textAlign = "center";
  const haloColor = panel ? c.frame : c.land;
  // In a panel, centre the block vertically; otherwise sit it above the bottom edge.
  let y = panel ? h - f - (panel - blockHeight) / 2 : h - f - 6 * u;
  for (let i = lines.length - 1; i >= 0; i--) {
    const l = lines[i];
    ctx.font = `${l.size}px "${l.font}"`;
    const halo = l.size * (l.font === spec.fonts.title ? 0.28 : 0.5);
    drawHaloText(ctx, l.text, w / 2, y, halo, haloColor, c.text);
    y -= gapAbove(i);
  }
}

function drawHaloText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  halo: number,
  haloColor: string,
  color: string,
) {
  ctx.lineWidth = halo;
  ctx.strokeStyle = haloColor;
  ctx.strokeText(text, x, y);
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

/** Ensures the style's fonts are ready before drawing to canvas. */
export async function loadFonts(spec: StyleSpec) {
  await Promise.all(
    [spec.fonts.title, spec.fonts.subtitle].map((f) => document.fonts.load(`32px "${f}"`)),
  );
}
