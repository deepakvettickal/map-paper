import { create } from "zustand";
import type { StyleSpec } from "./config/types";
import { SIZES } from "./config/sizes";
import { STYLES } from "./styles";

export interface ViewState {
  center: [number, number]; // [lng, lat]
  zoom: number;
  bearing: number;
}

type Editable = "title" | "subtitle" | "showCoords" | "showText" | "textScale" | "sizeId" | "dpi";

interface PosterStore {
  view: ViewState;
  /** Incremented to ask the map to jump to `view` (e.g. after a search). */
  jumpToken: number;
  spec: StyleSpec;
  title: string;
  subtitle: string;
  showCoords: boolean;
  showText: boolean;
  textScale: number;
  sizeId: string;
  dpi: number;
  setView: (v: ViewState) => void;
  jumpTo: (center: [number, number], zoom?: number) => void;
  setSpec: (spec: StyleSpec) => void;
  setColor: (key: keyof StyleSpec["colors"], value: string | string[]) => void;
  set: (patch: Partial<Pick<PosterStore, Editable>>) => void;
}

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

export const usePoster = create<PosterStore>((set) => ({
  view: { center: [4.8203, 52.6665], zoom: 15, bearing: 0 },
  jumpToken: 0,
  spec: clone(STYLES[0]),
  title: "Stad van de Zon",
  subtitle: "Heerhugowaard, Netherlands",
  showCoords: true,
  showText: true,
  textScale: 1,
  sizeId: SIZES[0].id,
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
  set: (patch) => set(patch),
}));

export function formatCoords([lng, lat]: [number, number]) {
  const ns = lat >= 0 ? "N" : "S";
  const ew = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}
