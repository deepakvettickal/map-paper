import type { SizePreset } from "./types";

export const SIZES: SizePreset[] = [
  { id: "a4", label: "A4 portrait", width: 210, height: 297, unit: "mm" },
  { id: "a3", label: "A3 portrait", width: 297, height: 420, unit: "mm" },
  { id: "square", label: "Square 30 cm", width: 300, height: 300, unit: "mm" },
  { id: "phone", label: "Phone wallpaper", width: 1290, height: 2796, unit: "px" },
  { id: "desktop-720p", label: "Desktop 720p", width: 1280, height: 720, unit: "px" },
  { id: "desktop-1080p", label: "Desktop 1080p", width: 1920, height: 1080, unit: "px" },
  { id: "desktop-2k", label: "Desktop 2K", width: 2560, height: 1440, unit: "px" },
  { id: "desktop", label: "Desktop 4K", width: 3840, height: 2160, unit: "px" },
  { id: "desktop-5k", label: "Desktop 5K", width: 5120, height: 2880, unit: "px" },
  { id: "desktop-6k", label: "Desktop 6K", width: 6144, height: 3456, unit: "px" },
  { id: "desktop-8k", label: "Desktop 8K", width: 7680, height: 4320, unit: "px" },
];

/** Size selected when the app opens. */
export const DEFAULT_SIZE_ID = "desktop";

/** Output pixel dimensions for a size preset at the given DPI (px presets ignore DPI). */
export function pixelSize(size: SizePreset, dpi: number) {
  if (size.unit === "px") return { width: size.width, height: size.height };
  const f = dpi / 25.4;
  return { width: Math.round(size.width * f), height: Math.round(size.height * f) };
}
