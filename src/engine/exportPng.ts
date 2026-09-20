import maplibregl from "maplibre-gl";
import type { EffectsSpec, StyleSpec } from "../config/types";
import { EffectsRenderer } from "./effects";
import { buildMapStyle, registerPatternProvider } from "./buildMapStyle";
import { drawOverlay, loadFonts, type OverlayText } from "../poster/drawOverlay";
import type { ViewState } from "../store";

interface ExportOptions {
  spec: StyleSpec;
  view: ViewState;
  text: OverlayText;
  /** CSS size of the on-screen preview; the export keeps this exact framing. */
  previewWidth: number;
  previewHeight: number;
  /** Output size in pixels. */
  width: number;
  height: number;
  /** Art-renderer effects to apply, already scaled; null for a clean render. */
  fx: EffectsSpec | null;
  /** Draw place names on the map. */
  labels: boolean;
}

/**
 * Renders the poster at print resolution: an offscreen MapLibre map with the same
 * CSS size and camera as the preview, but a higher pixelRatio, then composites
 * the frame and text on top.
 */
export async function renderPoster(opts: ExportOptions): Promise<Blob> {
  const pixelRatio = opts.width / opts.previewWidth;
  const container = document.createElement("div");
  // Kept on-screen but invisible: MapLibre never loads the style into a container
  // positioned far off-screen.
  Object.assign(container.style, {
    position: "fixed",
    left: "0",
    top: "0",
    opacity: "0",
    pointerEvents: "none",
    zIndex: "-1",
    width: `${opts.previewWidth}px`,
    height: `${opts.previewHeight}px`,
  });
  document.body.appendChild(container);

  const map = new maplibregl.Map({
    container,
    style: buildMapStyle(opts.spec, { labels: opts.labels }),
    center: opts.view.center,
    zoom: opts.view.zoom,
    bearing: opts.view.bearing,
    pixelRatio,
    interactive: false,
    attributionControl: false,
    fadeDuration: 0,
    canvasContextAttributes: { preserveDrawingBuffer: true },
  });
  registerPatternProvider(map);

  try {
    // Individual tile errors are non-fatal, so wait for idle with a safety timeout.
    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error("Timed out waiting for map tiles")), 60_000);
      map.once("idle", () => {
        clearTimeout(t);
        resolve();
      });
    });
    const mapCanvas = map.getCanvas();
    if (mapCanvas.width < opts.width * 0.99) {
      throw new Error(
        `Your GPU limited the render to ${mapCanvas.width}px wide (asked for ${opts.width}px). Try a lower DPI.`,
      );
    }
    await loadFonts(opts.spec);

    const out = document.createElement("canvas");
    out.width = opts.width;
    out.height = opts.height;
    const ctx = out.getContext("2d")!;
    if (opts.fx) {
      const overlay = document.createElement("canvas");
      overlay.width = opts.width;
      overlay.height = opts.height;
      drawOverlay(overlay.getContext("2d")!, opts.width, opts.height, opts.spec, opts.text);
      const fx = new EffectsRenderer();
      try {
        fx.render(mapCanvas, overlay, opts.width, opts.height, opts.fx);
        ctx.drawImage(fx.canvas, 0, 0);
      } finally {
        fx.dispose();
      }
    } else {
      ctx.drawImage(mapCanvas, 0, 0, opts.width, opts.height);
      drawOverlay(ctx, opts.width, opts.height, opts.spec, opts.text);
    }

    return await new Promise<Blob>((resolve, reject) =>
      out.toBlob((b) => (b ? resolve(b) : reject(new Error("PNG encoding failed"))), "image/png"),
    );
  } finally {
    map.remove();
    container.remove();
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
