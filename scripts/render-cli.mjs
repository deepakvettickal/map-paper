// Render one poster to a PNG file, headlessly, through the app's own export path.
// A stable flags-in / PNG-out interface over renderPoster() (src/engine/exportPng.ts) —
// the first concrete "API" surface for map-paper. The dev server must be running
// (npm run dev); the app's export globals are DEV-gated.
//
// Usage:
//   node scripts/render-cli.mjs --style cyanotype --lat 9.85 --lng 76.96 --zoom 12.5 \
//     --water "#1b4a6b" --waterDots "#0d2f47" --title "Idukki" --subtitle "Kerala" \
//     --out out.png
//
// Flags:
//   --style <id>        base style id (default heerhugowaard)
//   --lat --lng --zoom  framing (required for a specific place)
//   --size <id>         poster size id (default desktop)
//   --water <hex>       override colors.water for this render
//   --waterDots <hex>   override colors.waterDots for this render
//   --title --subtitle  overlay text (blank hides it)
//   --width --height    output pixels (default 3840x2160)
//   --labels            draw place names (default off)
//   --border [type]     draw the style's frame with no title (optional border type,
//                       e.g. plain/double/mat/ticks/deco); a title implies a border
//   --borderScale <n>   scale the frame width (1 = style default, 0.1 = a tenth)
//   --grain --paper --paperColor --vignette --wobble --misregister --pixelate
//                       override the art-renderer effects (e.g. weather-driven);
//                       any of these forces the effects on for this render
//   --out <file>        output PNG path (default out.png)
//   --base <url>        dev server base (default http://localhost:5173)
import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (!t.startsWith("--")) continue;
    const key = t.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) a[key] = true; // boolean flag
    else (a[key] = next), i++;
  }
  return a;
}

const args = parseArgs(process.argv.slice(2));
const style = args.style ?? "heerhugowaard";
const size = args.size ?? "desktop";
const W = Number(args.width ?? 3840);
const H = Number(args.height ?? 2160);
const out = args.out ?? "out.png";
const base = args.base ?? "http://localhost:5173";
const CHROME =
  process.env.CHROME ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const url = new URL(base);
url.searchParams.set("style", style);
url.searchParams.set("size", size);
if (args.lat != null) url.searchParams.set("lat", String(args.lat));
if (args.lng != null) url.searchParams.set("lng", String(args.lng));
if (args.zoom != null) url.searchParams.set("zoom", String(args.zoom));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  // --no-sandbox is required on CI runners (GitHub Actions) where the SUID sandbox
  // helper is not root-configured; harmless for local headless rendering.
  args: [
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ],
  defaultViewport: { width: 1400, height: 900 },
});

const page = await browser.newPage();
page.on("pageerror", (e) => console.error("pageerror:", e.message));
await page.goto(url.href, { waitUntil: "domcontentloaded" });
await page.waitForFunction(
  () => window.__map?.loaded() && window.__map.queryRenderedFeatures().length > 30,
  { timeout: 90000, polling: 500 },
);
await page.waitForFunction(() => window.__map?.areTilesLoaded(), { timeout: 90000, polling: 500 });
await page.evaluate(() => document.fonts.ready);
await new Promise((r) => setTimeout(r, 1500));

// Effect overrides (e.g. weather-driven): only keys passed are applied, merged
// onto the style's own effects. Any override forces the art renderer on.
const fxKeys = ["grain", "paper", "paperColor", "vignette", "wobble", "misregister", "pixelate"];
const fxOverrides = {};
for (const k of fxKeys) {
  if (args[k] === undefined) continue;
  fxOverrides[k] = k === "paperColor" ? args[k] : Number(args[k]);
}

const b64 = await page.evaluate(
  async ([w, h, water, waterDots, title, subtitle, labels, fxOverrides, borderArg, borderScaleArg]) => {
    const { renderPoster } = await import("/src/engine/exportPng.ts");
    const { usePoster, activeEffects, activeBorder } = await import("/src/store.ts");
    const s = usePoster.getState();
    // Clone the spec and override only the water colours for this render.
    const spec = { ...s.spec, colors: { ...s.spec.colors } };
    if (water) spec.colors.water = water;
    if (waterDots) spec.colors.waterDots = waterDots;
    const el = document.querySelector(".poster");
    const show = Boolean(title || subtitle);
    // Draw the frame when a title shows or --border is passed (border without title).
    const wantBorder = show || borderArg !== "";
    const borderType = typeof borderArg === "string" && borderArg && borderArg !== "true"
      ? borderArg
      : activeBorder(s);
    const bScale = borderScaleArg > 0 ? borderScaleArg : 1;
    // Merge effect overrides onto the style's effects; presence forces fx on.
    const hasOverride = Object.keys(fxOverrides).length > 0;
    const fx = hasOverride
      ? { ...(s.spec.effects ?? {}), ...(activeEffects(s) ?? {}), ...fxOverrides }
      : activeEffects(s);
    const blob = await renderPoster({
      spec,
      view: s.view,
      text: {
        title: title || "",
        subtitle: subtitle || "",
        coords: null,
        show,
        scale: 1,
        border: borderType,
        borderScale: wantBorder ? bScale : 0,
      },
      previewWidth: el.clientWidth,
      previewHeight: el.clientHeight,
      width: w,
      height: h,
      fx,
      labels,
    });
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = "";
    for (const byte of buf) bin += String.fromCharCode(byte);
    return btoa(bin);
  },
  [
    W,
    H,
    args.water ?? "",
    args.waterDots ?? "",
    args.title ?? "",
    args.subtitle ?? "",
    Boolean(args.labels),
    fxOverrides,
    args.border === undefined ? "" : String(args.border),
    args.borderScale === undefined ? 0 : Number(args.borderScale),
  ],
);

writeFileSync(out, Buffer.from(b64, "base64"));
console.log("wrote", out);
await browser.close();
