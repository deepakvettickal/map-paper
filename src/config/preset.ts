import type { StyleSpec } from "./types";
import type { BorderType } from "../poster/borders";

/**
 * A complete poster as plain JSON: the style, the place and every setting that
 * affects the image. Exported for sharing and re-imported to reproduce a poster
 * exactly, and the same shape the gallery will eventually replay.
 */
export interface Preset {
  /** Bumped if the shape ever changes, so old files can be migrated. */
  version: 1;
  app: "map-paper";
  savedAt: string;
  spec: StyleSpec;
  view: { center: [number, number]; zoom: number; bearing: number };
  text: { title: string; subtitle: string; show: boolean; scale: number; coords: boolean };
  map: { labels: boolean };
  border: { type: BorderType | null; scale: number };
  effects: { on: boolean; amount: number };
  output: { sizeId: string; dpi: number };
}

export interface PresetSource {
  spec: StyleSpec;
  view: { center: [number, number]; zoom: number; bearing: number };
  title: string;
  subtitle: string;
  showText: boolean;
  textScale: number;
  showCoords: boolean;
  showLabels: boolean;
  border: BorderType | null;
  borderScale: number;
  fxOn: boolean;
  fxAmount: number;
  sizeId: string;
  dpi: number;
}

export function toPreset(s: PresetSource): Preset {
  return {
    version: 1,
    app: "map-paper",
    savedAt: new Date().toISOString(),
    spec: s.spec,
    view: { center: s.view.center, zoom: s.view.zoom, bearing: s.view.bearing },
    text: {
      title: s.title,
      subtitle: s.subtitle,
      show: s.showText,
      scale: s.textScale,
      coords: s.showCoords,
    },
    map: { labels: s.showLabels },
    border: { type: s.border, scale: s.borderScale },
    effects: { on: s.fxOn, amount: s.fxAmount },
    output: { sizeId: s.sizeId, dpi: s.dpi },
  };
}

/** Validates an imported file. Returns a preset or throws with a readable reason. */
export function parsePreset(text: string): Preset {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON");
  }
  const p = raw as Partial<Preset>;
  if (p?.app !== "map-paper") throw new Error("That file is not a map-paper preset");
  if (p.version !== 1) throw new Error(`Unsupported preset version: ${String(p.version)}`);
  if (!p.spec?.colors || !p.spec.roadWidths) throw new Error("The preset is missing its style");
  if (!Array.isArray(p.view?.center) || p.view.center.length !== 2) {
    throw new Error("The preset is missing a valid location");
  }
  return p as Preset;
}

export function presetFilename(p: Preset) {
  const slug = (p.text.title || "map").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${slug || "map"}-${p.spec.id}.map-paper.json`;
}
