import { create } from "zustand";
import type { EffectsSpec, StyleSpec } from "./config/types";
import { hasEffects, scaleEffects } from "./engine/effects";
import { DEFAULT_SIZE_ID, SIZES } from "./config/sizes";
import { BORDERS, type BorderType } from "./poster/borders";
import { PLACES } from "./config/places";
import { shiftColor } from "./engine/color";
import { DEFAULT_STYLE_ID, STYLES } from "./styles";

export const UI_THEMES = ["light", "dark", "amoled"] as const;
export type UiTheme = (typeof UI_THEMES)[number];

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
  | "uiTheme"
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
  /** How far the palette was pushed from the style's own, after Surprise me. */
  drift: { percent: number; hue: number } | null;
  /** Chrome around the poster. */
  uiTheme: UiTheme;
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
  /** New style, new place, and a fresh but still harmonious recolour. */
  randomise: () => void;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

const params = new URLSearchParams(location.search);
const startSpec =
  STYLES.find((s) => s.id === params.get("style")) ??
  STYLES.find((s) => s.id === DEFAULT_STYLE_ID) ??
  STYLES[0];
const startView = startSpec.defaultView;
const num = (k: string, fallback: number) => {
  const v = Number(params.get(k));
  return Number.isFinite(v) && params.has(k) ? v : fallback;
};

export const usePoster = create<PosterStore>((set) => ({
  // `?lat=&lng=&zoom=` opens a specific view (handy for comparing styles).
  view: {
    center: [num("lng", startView?.center[0] ?? -0.151396), num("lat", startView?.center[1] ?? 51.51153)],
    zoom: num("zoom", startView?.zoom ?? 15),
    bearing: num("bearing", 0),
  },
  jumpToken: 0,
  // `?style=<id>` opens a specific style directly.
  spec: clone(startSpec),
  title: startView?.title ?? "Grosvenor Square",
  subtitle: startView?.subtitle ?? "London, UK",
  showCoords: true,
  showLabels: false,
  border: (BORDERS as readonly string[]).includes(params.get("border") ?? "")
    ? (params.get("border") as BorderType)
    : null,
  borderScale: 1,
  drift: null,
  uiTheme: (localStorage.getItem("ui-theme") as UiTheme | null) ?? "dark",
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
  // Picking a style also moves to the place that style was designed around.
  setSpec: (spec) =>
    set((s) => {
      const v = spec.defaultView;
      if (!v) return { spec: clone(spec) };
      return {
        spec: clone(spec),
        view: { ...s.view, center: [...v.center] as [number, number], zoom: v.zoom },
        jumpToken: s.jumpToken + 1,
        title: v.title,
        subtitle: v.subtitle,
        drift: null,
      };
    }),
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
  set: (patch) => {
    if (patch.uiTheme) localStorage.setItem("ui-theme", patch.uiTheme);
    set(patch);
  },
  randomise: () =>
    set((s) => {
      const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
      const spec = clone(pick(STYLES));
      const place = pick(PLACES);
      // Rotate the whole palette by one hue angle and nudge its chroma. Shifting
      // every colour together keeps the style's own contrast, so the result still
      // looks composed rather than random.
      const shift = {
        rotate: Math.random() * 360,
        chroma: 0.75 + Math.random() * 0.7,
        lighten: (Math.random() - 0.5) * 0.06,
      };
      const recolor = (hex: string) => shiftColor(hex, shift);
      const colors = Object.fromEntries(
        Object.entries(spec.colors).map(([k, v]) => [
          k,
          Array.isArray(v) ? v.map(recolor) : recolor(v as string),
        ]),
      ) as typeof spec.colors;
      spec.colors = colors;
      if (spec.roadColors) {
        spec.roadColors = Object.fromEntries(
          Object.entries(spec.roadColors).map(([k, v]) => [k, recolor(v as string)]),
        );
      }
      if (spec.patterns) {
        spec.patterns = Object.fromEntries(
          Object.entries(spec.patterns).map(([k, p]) => [k, { ...p!, color: recolor(p!.color) }]),
        );
      }
      if (spec.roadGlow) spec.roadGlow = { ...spec.roadGlow, color: recolor(spec.roadGlow.color) };
      if (spec.grid) spec.grid = { ...spec.grid, color: recolor(spec.grid.color) };
      if (spec.effects?.paperColor) {
        spec.effects = { ...spec.effects, paperColor: recolor(spec.effects.paperColor) };
      }
      // A readable measure of the recolour: how far round the hue wheel it went,
      // plus how much the chroma changed.
      const hueTravel = Math.min(shift.rotate, 360 - shift.rotate) / 180;
      const chromaTravel = Math.abs(shift.chroma - 1) / 0.7;
      const percent = Math.round(Math.min(100, (hueTravel * 0.75 + chromaTravel * 0.25) * 100));
      return {
        spec,
        view: { ...s.view, center: [...place.center] as [number, number], zoom: place.zoom },
        jumpToken: s.jumpToken + 1,
        title: place.title,
        subtitle: place.subtitle,
        border: pick(BORDERS),
        drift: { percent, hue: Math.round(shift.rotate) },
      };
    }),
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
