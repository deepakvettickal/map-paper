// Screenshots the poster for one or more styles using the locally installed Chrome.
// Usage: node scripts/snap.mjs <outDir> [styleId ...]   (dev server must be running)
import puppeteer from "puppeteer-core";

const [outDir = "snaps", ...ids] = process.argv.slice(2);
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--window-size=1400,1000"],
  defaultViewport: { width: 1400, height: 1000 },
});
for (const id of ids.length ? ids : ["heerhugowaard"]) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.error(id, e.message));
  await page.goto(`http://localhost:5173/?style=${id}${process.env.VIEW ?? "&size=desktop"}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => window.__map?.loaded() && window.__map.areTilesLoaded() && window.__map.queryRenderedFeatures().length > 50, {
    timeout: 60000,
    polling: 500,
  });
  await page.evaluate(() => document.fonts.ready);
  await new Promise((r) => setTimeout(r, 1000));
  const el = await page.$(".poster");
  await el.screenshot({ path: `${outDir}/${id}.png` });
  console.log("saved", id);
  await page.close();
}
await browser.close();
