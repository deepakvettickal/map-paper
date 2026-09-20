import type { SizePreset } from "./types";

export const SIZES: SizePreset[] = [
  { id: "a4", label: "A4 portrait", width: 210, height: 297, unit: "mm" },
  { id: "a3", label: "A3 portrait", width: 297, height: 420, unit: "mm" },
  { id: "square", label: "Square 30 cm", width: 300, height: 300, unit: "mm" },
  { id: "phone", label: "Phone wallpaper", width: 1290, height: 2796, unit: "px" },
  { id: "desktop", label: "Desktop 4K", width: 3840, height: 2160, unit: "px" },
];

/** Size selected when the app opens. */
export const DEFAULT_SIZE_ID = "desktop";

/** Output pixel dimensions for a size preset at the given DPI (px presets ignore DPI). */
export function pixelSize(size: SizePreset, dpi: number) {
  if (size.unit === "px") return { width: size.width, height: size.height };
  const f = dpi / 25.4;
  return { width: Math.round(size.width * f), height: Math.round(size.height * f) };
}
