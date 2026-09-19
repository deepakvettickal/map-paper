export type RoadClass =
  | "motorway"
  | "trunk"
  | "primary"
  | "secondary"
  | "tertiary"
  | "minor"
  | "service"
  | "path";

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
  };
  /** Road widths in px at zoom 16 (scaled exponentially with zoom). */
  roadWidths: Record<RoadClass, number>;
  /** Extra width of the casing on each side, as a fraction of the road width. */
  casingRatio: number;
  outlineWidth: number;
  waterPattern: boolean;
  fonts: { title: string; subtitle: string };
  /** Frame thickness as a fraction of poster width. */
  frameWidth: number;
}

export interface SizePreset {
  id: string;
  label: string;
  width: number;
  height: number;
  unit: "mm" | "px";
}
