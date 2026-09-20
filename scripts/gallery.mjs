// Builds the README gallery: one compressed JPEG per style, plus the hero image.
// Usage: node scripts/gallery.mjs [styleId…]   (dev server must be running)
// With no ids it rebuilds every image and the hero.
import { existsSync, readFileSync, mkdirSync, readdirSync } from "node:fs";
import puppeteer from "puppeteer-core";
import { STYLE_IDS } from "./style-ids.mjs";

const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
// Desktop-4K shape for every image; the place comes from each style's own default view.
const VIEW = "&size=desktop";
const OUT = "docs/gallery";
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  // deviceScaleFactor 3 renders the poster at ~2500px wide, sharp on any screen.
  defaultViewport: { width: 900, height: 620, deviceScaleFactor: 3 },
});

// Hero: downscale the 4K synthwave export to a web-sized JPEG. Skipped when the
// source export is not present locally (it is git-ignored).
const HERO_SRC = "grosvenor-square-synthwave-3840x2160.png";
if (existsSync(HERO_SRC) && process.argv.length <= 2) {
const hero = readFileSync(HERO_SRC).toString("base64");
const page = await browser.newPage();
await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
await page.setContent(
  `<body style="margin:0"><img src="data:image/png;base64,${hero}" style="width:1600px;display:block"></body>`,
);
await page.screenshot({ path: "docs/hero.jpg", type: "jpeg", quality: 86 });
await page.close();
} else {
  console.log("keeping docs/hero.jpg");
}

const only = process.argv.slice(2);
for (const id of only.length ? only : STYLE_IDS) {
  const p = await browser.newPage();
  await p.goto(`http://localhost:5173/?style=${id}${VIEW}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForFunction(
    () => window.__map?.loaded() && window.__map.areTilesLoaded() && window.__map.queryRenderedFeatures().length > 50,
    { timeout: 60000, polling: 500 },
  );
  await p.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 900));
  const el = await p.$(".poster");
  await el.screenshot({ path: `${OUT}/${id}.jpg`, type: "jpeg", quality: 92 });
  await p.close();
  console.log("saved", id);
}
await browser.close();
console.log(readdirSync(OUT).length, "gallery images");
