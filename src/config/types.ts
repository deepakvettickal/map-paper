export type RoadClass =
  | "motorway"
  | "trunk"
  | "primary"
  | "secondary"
  | "tertiary"
  | "minor"
  | "service"
  | "path";

/** A tileable fill pattern, generated on demand (see engine/patterns.ts). */
export interface PatternSpec {
  type: "hatch" | "cross" | "lines" | "dots" | "stipple" | "waves";
  color: string;
  bg: string;
  /** Tile spacing in CSS px. */
  spacing: number;
  /** Line width / dot radius in CSS px. */
  width?: number;
}

/**
 * Art-renderer post effects applied to the composited poster (map + text).
 * Lengths are fractions of the poster width, so the look is resolution-independent.
 */
export interface EffectsSpec {
  /** Fine printing grain, 0–0.3. */
  grain?: number;
  /** Mottled paper tone, 0–1, blended towards `paperColor`. */
  paper?: number;
  paperColor?: string;
  /** Hand-drawn wobble displacement, e.g. 0.0005–0.003. */
  wobble?: number;
  /** Wobble frequency (noise cells across the poster width). */
  wobbleScale?: number;
  /** Ink misregistration offset, e.g. 0.001. */
  misregister?: number;
  /** Pixel-art cell size, e.g. 0.006. */
  pixelate?: number;
  /** Edge darkening, 0–1. */
  vignette?: number;
}

/**
 * Optional styling for map place names. MapLibre needs SDF glyphs, and the tile
 * server only serves Noto Sans, so a style tunes colour, weight, case and size
 * rather than the typeface.
 */
export interface LabelSpec {
  bold?: boolean;
  /** Defaults to colors.text. */
  color?: string;
  /** Halo behind the text; defaults to colors.land. */
  halo?: string;
  uppercase?: boolean;
  /** Multiplier on the default label sizes. */
  scale?: number;
  letterSpacing?: number;
}

/** A complete, JSON-serialisable description of one map art style. */
export interface StyleSpec {
  id: string;
  name: string;
  credit: string;
  colors: {
    land: string;
    water: string;
    waterDots: string;
    green: string;
    forest: string;
    sand: string;
    /** Buildings cycle through this palette by feature id. */
    buildings: string[];
    outline: string;
    road: string;
    roadCasing: string;
    rail: string;
    frame: string;
    text: string;
    /** Optional element colours; each falls back to a tint of the palette. */
    landuse?: string;
    aeroway?: string;
    waterway?: string;
    transit?: string;
  };
  /** Road widths in px at zoom 16 (scaled exponentially with zoom). */
  roadWidths: Record<RoadClass, number>;
  /** Extra width of the casing on each side, as a fraction of the road width. */
  casingRatio: number;
  outlineWidth: number;
  waterPattern: boolean;
  fonts: { title: string; subtitle: string };
  /** Frame thickness as a fraction of the poster's shorter side. */
  frameWidth: number;
  /** Default border treatment; the user can pick another. */
  border?: "plain" | "double" | "mat" | "ticks" | "deco";
  /** Optional pattern fills; a pattern replaces the flat colour of that layer. */
  patterns?: Partial<Record<"water" | "green" | "forest" | "buildings", PatternSpec>>;
  /** Optional styling for place names, shown when the user turns labels on. */
  labels?: LabelSpec;
  /** Optional art-renderer post effects. */
  effects?: EffectsSpec;
  /** Optional per-class road colours; classes not listed use `colors.road`. */
  roadColors?: Partial<Record<RoadClass, string>>;
  /** Optional solid band behind the title block (uses `colors.frame`); height as % of the shorter side. */
  textPanel?: { height: number };
  /** Optional soft glow drawn under the roads (neon / night styles). */
  roadGlow?: { color: string; widthFactor: number; opacity: number };
  /** Optional grid drawn over the map (drafting / blueprint styles). */
  grid?: { color: string; opacity: number; /** spacing as % of the shorter side */ spacing: number };
}

export interface SizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  unit: "mm" | "px";
}
