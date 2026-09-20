// Builds docs/hero.jpg: one place rendered in two styles, split down the middle.
// Usage: node scripts/hero.mjs [styleA] [styleB] [lat] [lng] [zoom] [place] [region]
// The dev server must be running.
import puppeteer from "puppeteer-core";
import { writeFileSync } from "node:fs";

const [a = "booth", b = "neon", lat = "52.37154664", lng = "4.97081009", zoom = "13.6", place = "Amsterdam", region = "The Netherlands"] =
  process.argv.slice(2);
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const W = 3840;
const H = 2160;

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  defaultViewport: { width: 1400, height: 900 },
});

/** Renders one style at full 4K through the app's own export path. */
async function render(style) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(style, e.message));
  await page.goto(
    `http://localhost:5173/?style=${style}&lat=${lat}&lng=${lng}&zoom=${zoom}&size=desktop`,
    { waitUntil: "domcontentloaded" },
  );
  await page.waitForFunction(
    () => window.__map?.loaded() && window.__map.queryRenderedFeatures().length > 30,
    { timeout: 90000, polling: 500 },
  );
  await page.evaluate(() => window.__store.getState().set({ showLabels: true }));
  await page.waitForFunction(() => window.__map?.areTilesLoaded(), { timeout: 90000, polling: 500 });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1500));
  const data = await page.evaluate(
    async ([w, h]) => {
      const { renderPoster } = await import("/src/engine/exportPng.ts");
      const { usePoster, activeEffects, activeBorder } = await import("/src/store.ts");
      const s = usePoster.getState();
      const el = document.querySelector(".poster");
      const blob = await renderPoster({
        spec: s.spec,
        view: s.view,
        // No titles on the hero: the two palettes are the subject.
        text: { title: "", subtitle: "", coords: null, show: false, scale: 1, border: activeBorder(s), borderScale: 0 },
        previewWidth: el.clientWidth,
        previewHeight: el.clientHeight,
        width: w,
        height: h,
        fx: activeEffects(s),
        labels: true,
      });
      const buf = new Uint8Array(await blob.arrayBuffer());
      let bin = "";
      for (const byte of buf) bin += String.fromCharCode(byte);
      return btoa(bin);
    },
    [W, H],
  );
  await page.close();
  console.log("rendered", style);
  return data;
}

const [imgA, imgB] = [await render(a), await render(b)];

// Splice: style A top-left of the diagonal, style B bottom-right, with a thin seam.
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900 });
await page.goto("http://localhost:5173/", { waitUntil: "domcontentloaded" });
await page.evaluate(() => document.fonts.ready);
const jpeg = await page.evaluate(
  async ([A, B, w, h, name, region]) => {
    const load = (b64) =>
      new Promise((res) => {
        const i = new Image();
        i.onload = () => res(i);
        i.src = `data:image/png;base64,${b64}`;
      });
    const [ia, ib] = [await load(A), await load(B)];
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const x = c.getContext("2d");
    // Straight split: first style on the left, second on the right.
    x.drawImage(ia, 0, 0, w, h);
    x.save();
    x.beginPath();
    x.rect(w / 2, 0, w / 2, h);
    x.clip();
    x.drawImage(ib, 0, 0, w, h);
    x.restore();
    x.strokeStyle = "rgba(255,255,255,0.8)";
    x.lineWidth = Math.max(2, w * 0.0012);
    x.beginPath();
    x.moveTo(w / 2, 0);
    x.lineTo(w / 2, h);
    x.stroke();

    // The place name, once, across the seam.
    const size = h * 0.062;
    x.font = `600 ${size}px "Josefin Sans"`;
    x.textAlign = "center";
    x.textBaseline = "alphabetic";
    x.letterSpacing = `${size * 0.22}px`;
    const y = h - h * 0.062;
    x.shadowColor = "rgba(0,0,0,0.55)";
    x.shadowBlur = size * 0.5;
    x.fillStyle = "rgba(255,255,255,0.96)";
    x.fillText(name.toUpperCase(), w / 2, y);
    x.shadowBlur = 0;
    const sub = size * 0.3;
    x.font = `400 ${sub}px "IBM Plex Mono"`;
    x.letterSpacing = `${sub * 0.35}px`;
    x.fillStyle = "rgba(255,255,255,0.8)";
    x.fillText(region.toUpperCase(), w / 2, y + sub * 2.1);
    return c.toDataURL("image/jpeg", 0.93).split(",")[1];
  },
  [imgA, imgB, W, H, place, region],
);
writeFileSync("docs/hero.jpg", Buffer.from(jpeg, "base64"));
console.log("wrote docs/hero.jpg");
await browser.close();
