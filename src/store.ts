import { create } from "zustand";
import type { EffectsSpec, StyleSpec } from "./config/types";
import { hasEffects, scaleEffects } from "./engine/effects";
import { DEFAULT_SIZE_ID, SIZES } from "./config/sizes";
import { BORDERS, type BorderType } from "./poster/borders";
import { DEFAULT_STYLE_ID, STYLES } from "./styles";

export interface ViewState {
  center: [number, number]; // [lng, lat]
  zoom: number;
  bearing: number;
}

type Editable =
  | "title"
  | "subtitle"
  | "showCoords"
  | "showLabels"
  | "border"
  | "borderScale"
  | "showText"
  | "textScale"
  | "fxOn"
  | "fxAmount"
  | "sizeId"
  | "dpi";

interface PosterStore {
  view: ViewState;
  /** Incremented to ask the map to jump to `view` (e.g. after a search). */
  jumpToken: number;
  spec: StyleSpec;
  title: string;
  subtitle: string;
  showCoords: boolean;
  /** Draw place names on the map itself. */
  showLabels: boolean;
  /** Border treatment; null follows the style's own default. */
  border: BorderType | null;
  /** Multiplier on the style's border thickness. */
  borderScale: number;
  showText: boolean;
  textScale: number;
  /** Art renderer on/off and overall strength (0–2). */
  fxOn: boolean;
  fxAmount: number;
  sizeId: string;
  dpi: number;
  setView: (v: ViewState) => void;
  jumpTo: (center: [number, number], zoom?: number) => void;
  setSpec: (spec: StyleSpec) => void;
  setColor: (key: keyof StyleSpec["colors"], value: string | string[]) => void;
  /** Ink colour of a pattern fill (the background follows the layer's colour). */
  /** Title or subtitle typeface. */
  setFont: (key: "title" | "subtitle", value: string) => void;
  setPatternColor: (layer: keyof NonNullable<StyleSpec["patterns"]>, value: string) => void;
  setRoadColor: (cls: string, value: string) => void;
  set: (patch: Partial<Pick<PosterStore, Editable>>) => void;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const params = new URLSearchParams(location.search);
const num = (k: string, fallback: number) => {
  const v = Number(params.get(k));
  return Number.isFinite(v) && params.has(k) ? v : fallback;
};

export const usePoster = create<PosterStore>((set) => ({
  // `?lat=&lng=&zoom=` opens a specific view (handy for comparing styles).
  view: {
    center: [num("lng", -0.151396), num("lat", 51.51153)],
    zoom: num("zoom", 15),
    bearing: num("bearing", 0),
  },
  jumpToken: 0,
  // `?style=<id>` opens a specific style directly.
  spec: clone(
    STYLES.find((s) => s.id === params.get("style")) ??
      STYLES.find((s) => s.id === DEFAULT_STYLE_ID) ??
      STYLES[0],
  ),
  title: "Grosvenor Square",
  subtitle: "London, UK",
  showCoords: true,
  showLabels: false,
  border: (BORDERS as readonly string[]).includes(params.get("border") ?? "")
    ? (params.get("border") as BorderType)
    : null,
  borderScale: 1,
  showText: true,
  textScale: 0.6,
  fxOn: true,
  fxAmount: 0.5,
  sizeId: SIZES.find((z) => z.id === params.get("size"))?.id ?? DEFAULT_SIZE_ID,
  dpi: 300,
  setView: (view) => set({ view }),
  jumpTo: (center, zoom) =>
    set((s) => ({
      view: { ...s.view, center, zoom: zoom ?? s.view.zoom },
      jumpToken: s.jumpToken + 1,
    })),
  setSpec: (spec) => set({ spec: clone(spec) }),
  setColor: (key, value) =>
    set((s) => ({ spec: { ...s.spec, colors: { ...s.spec.colors, [key]: value } } })),
  setFont: (key, value) =>
    set((s) => ({ spec: { ...s.spec, fonts: { ...s.spec.fonts, [key]: value } } })),
  setPatternColor: (layer, value) =>
    set((s) => ({
      spec: {
        ...s.spec,
        patterns: { ...s.spec.patterns, [layer]: { ...s.spec.patterns![layer]!, color: value } },
      },
    })),
  setRoadColor: (cls, value) =>
    set((s) => ({ spec: { ...s.spec, roadColors: { ...s.spec.roadColors, [cls]: value } } })),
  set: (patch) => set(patch),
}));

if (import.meta.env.DEV) (window as unknown as { __store: unknown }).__store = usePoster;

export function formatCoords([lng, lat]: [number, number]) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

/** The effects to render right now, or null when the art renderer is off or unused. */
export function activeEffects(s: { spec: StyleSpec; fxOn: boolean; fxAmount: number }): EffectsSpec | null {
  if (!s.fxOn || !hasEffects(s.spec.effects)) return null;
  return scaleEffects(s.spec.effects, s.fxAmount);
}

/** The border to draw: the user's choice, else the style's default, else plain. */
export function activeBorder(s: { spec: StyleSpec; border: BorderType | null }): BorderType {
  return s.border ?? s.spec.border ?? "plain";
}
