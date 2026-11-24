import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const EMAIL = process.env.ADMIN_EMAIL ?? "admin@gmail.com";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "123456";
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

  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[placeholder="**********"]', PASSWORD);
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
