// Builds the README gallery: one JPEG per style at 1920x1080.
// The hero image is built separately by scripts/hero.mjs.
// Usage: node scripts/gallery.mjs [styleId…]   (dev server must be running)
// With no ids it rebuilds every image and the hero.
import { mkdirSync, readdirSync } from "node:fs";
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
  // The sidebar takes 300px and the poster gets a 32px gutter: this leaves a
  // 640x360 CSS poster, so deviceScaleFactor 3 writes exactly 1920x1080.
  defaultViewport: { width: 1004, height: 424, deviceScaleFactor: 3 },
});

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
