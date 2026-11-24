/**
 * Captures the README screenshots (desktop + mobile) from the running app.
 *
 *   1. Start the API and the frontend (npm run dev).
 *   2. npm i -D playwright && npx playwright install chromium
 *   3. node scripts/capture-screenshots.mjs
 *

 * Demo mode (no backend): NEXT_PUBLIC_DEMO=true npm run dev, then ADMIN_EMAIL=admin@demo.com ADMIN_PASSWORD=demo1234 node scripts/capture-screenshots.mjs
 * Optional env: BASE_URL (default http://localhost:3000), ADMIN_EMAIL, ADMIN_PASSWORD.
 * Output: docs/screenshots/<page>-<desktop|mobile>.png (names match the README).
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL ?? "https://doctor-tracker-frontend-dun.vercel.app";
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@gmail.com";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "admin@#486";
const OUT = "docs/screenshots";

const VIEWPORTS = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();

for (const [label, options] of Object.entries(VIEWPORTS)) {
  const context = await browser.newContext(options);
  const page = await context.newPage();

  const response = await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" }).catch((e) => {
    console.error(`Cannot open ${BASE_URL}/login: ${e.message}\nIs the frontend running (pnpm dev) and is BASE_URL the right port?`);
    process.exit(1);
  });
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 20_000 });
  } catch {
    await page.screenshot({ path: `${OUT}/debug-login-${label}.png` });
    const text = (await page.locator("body").innerText().catch(() => "")).slice(0, 600);
    console.error(`Login form not found.\n  URL: ${page.url()}\n  HTTP status: ${response?.status()}\n  Page text: ${text}\n  Screenshot: ${OUT}/debug-login-${label}.png`);
    process.exit(1);
  }
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[autocomplete="current-password"]', PASSWORD);
  await Promise.all([page.waitForURL("**/dashboard**", { timeout: 20_000 }), page.click('button[type="submit"]')]);

  const shot = async (name) => {
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(800); // let charts finish animating
    await page.screenshot({ path: `${OUT}/${name}-${label}.png`, fullPage: true });
    console.log(`saved ${OUT}/${name}-${label}.png`);
  };

  await shot("dashboard");

  await page.goto(`${BASE_URL}/dashboard/doctors`);
  await shot("doctors");

  await page.locator('a[href^="/dashboard/doctors/"]').first().click();
  await page.waitForURL("**/dashboard/doctors/*");
  await shot("doctor-detail");

  await page.goto(`${BASE_URL}/dashboard/patients`);
  await shot("patients");

  await context.close();
}

await browser.close();