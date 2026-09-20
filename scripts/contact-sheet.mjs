// Combines snapshot PNGs into contact sheets (N per sheet) for quick side-by-side review.
// Usage: node scripts/contact-sheet.mjs <dir> [perSheet=6]
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";

const [dir, per = "6"] = process.argv.slice(2);
const CHROME = process.env.CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const files = readdirSync(dir).filter((f) => f.endsWith(".png") && !f.startsWith("sheet"));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new" });
const page = await browser.newPage();
await page.setViewport({ width: 1500, height: 1100 });

for (let i = 0; i < files.length; i += Number(per)) {
  const batch = files.slice(i, i + Number(per));
  const cells = batch
    .map((f) => {
      const src = `data:image/png;base64,${readFileSync(join(dir, f)).toString("base64")}`;
      return `<figure><img src="${src}"><figcaption>${f.replace(".png", "")}</figcaption></figure>`;
    })
    .join("");
  await page.setContent(`<style>
    body{margin:0;background:#222;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px;font:16px sans-serif;color:#eee}
    figure{margin:0} img{width:100%;display:block} figcaption{padding:4px 0}
  </style>${cells}`);
  const out = join(dir, `sheet-${i / Number(per) + 1}.png`);
  await page.screenshot({ path: out, fullPage: true });
  console.log(out);
}
await browser.close();
