// Renders the goggles posters (src/assets/goggles-<view>.png) from the live 3D scene.
//
// Usage: start `npm run dev`, then run `npm run posters` (optionally with BASE_URL=http://localhost:3000).
// Needs Playwright's Chromium: `npx playwright install chromium` once.
import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:3000";
// Each view renders at the size set in src/components/goggles/scene.ts (POSTER_SIZE).
const views = ["hero", "anatomy"];

const browser = await chromium.launch({
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});
try {
  for (const view of views) {
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
    await page.goto(`${base}/dev/render?view=${view}`, { waitUntil: "load" });
    await page.waitForSelector("#poster[data-ready]", { timeout: 60_000 });
    await page.waitForTimeout(1500);
    const stage = await page.$("#poster");
    await stage.screenshot({ path: `src/assets/goggles-${view}.png`, omitBackground: true });
    console.log(`src/assets/goggles-${view}.png`);
    await page.close();
  }
} finally {
  await browser.close();
}
