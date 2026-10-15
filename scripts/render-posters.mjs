// Renders the goggles posters from the live 3D scene into src/assets:
//   goggles-hero.png and goggles-product-1.png to goggles-product-4.png (one per product beat).
//
// Usage: start `npm run dev`, then run `npm run posters` (optionally with BASE_URL=http://localhost:3000).
// Needs Playwright's Chromium: `npx playwright install chromium` once.
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3000";
// Sizes come from POSTER_SIZE and poses from PRODUCT_BEATS in src/components/goggles/scene.ts.
const posters = [
  { file: "goggles-hero.png", query: "view=hero" },
  { file: "goggles-product-1.png", query: "view=product&progress=0" },
  { file: "goggles-product-2.png", query: `view=product&progress=${1 / 3}` },
  { file: "goggles-product-3.png", query: `view=product&progress=${2 / 3}` },
  { file: "goggles-product-4.png", query: "view=product&progress=1" },
];

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
try {
  for (const { file, query } of posters) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
    await page.goto(`${base}/dev/render?${query}`, { waitUntil: "load" });
    await page.waitForSelector("#poster[data-ready]", { timeout: 90_000 });
    await page.waitForTimeout(1500);
    const stage = await page.$("#poster");
    await stage.screenshot({ path: `src/assets/${file}`, omitBackground: true });
    console.log(`src/assets/${file}`);
    await page.close();
  }
} finally {
  await browser.close();
}
