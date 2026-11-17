// End-to-end smoke test against a running server.
// Usage: npm run build && npm start      (terminal 1)
//        npm run test:e2e [baseUrl]      (terminal 2; needs `npx playwright install chromium` once)
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
let failed = 0;
const visible = (loc) => loc.first().waitFor({ state: "visible", timeout: 8000 }).then(() => true, () => false);
const check = (name, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};
const cards = (page) => page.getByTestId("listing-card").count();

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// Home: honesty, indexing, effects present
let res = await page.goto(BASE, { waitUntil: "networkidle" });
check("home 200", res.status() === 200);
check("noindex header", (res.headers()["x-robots-tag"] ?? "").includes("noindex"));
check("noindex meta", (await page.locator('meta[name="robots"]').getAttribute("content"))?.includes("noindex"));
check("concept note visible", await visible(page.getByText("Concept redesign by")));
check("skip link", (await page.getByRole("link", { name: "Skip to content" }).count()) === 1);
check("hero heading", await visible(page.getByRole("heading", { level: 1, name: /never find alone/ })));
check("tagline reveal", (await page.locator(".tag-word").count()) > 10);
check("3D photo wall", await visible(page.getByRole("region", { name: "The portfolio" })));

// Results via URL
await page.goto(`${BASE}/rent`, { waitUntil: "networkidle" });
const allRent = await cards(page);
check("rent list", allRent === 23, `${allRent} cards`);
await page.goto(`${BASE}/buy?view=Panoramic`, { waitUntil: "networkidle" });
check("buy panoramic filter", (await cards(page)) === 11, `${await cards(page)} cards`);

// Filter through the UI rewrites the URL
await page.goto(`${BASE}/rent`, { waitUntil: "networkidle" });
await page.getByRole("combobox", { name: "District" }).click();
await page.getByRole("option", { name: /^District VI \(/ }).click();
await page.waitForURL(/\/rent\?district=VI/);
await page.waitForFunction(() => document.querySelectorAll('[data-testid="listing-card"]').length === 8, null, { timeout: 8000 }).catch(() => {});
check("district filter via UI", (await cards(page)) === 8, `${await cards(page)} cards`);

// Property + viewing request
await page.goto(`${BASE}/property/turul-villa-927331`, { waitUntil: "networkidle" });
check("property page", await visible(page.getByRole("heading", { level: 1, name: "Turul Villa" })));
await page.getByRole("button", { name: "Request a viewing" }).click();
check("viewing form shows field errors", await visible(page.getByText("Tell us your name")));
await page.locator("#v-name").fill("Anna Kovács");
await page.locator("#v-email").fill("anna@example.com");
await page.locator("#v-phone").fill("+36 20 123 4567");
await page.getByRole("combobox", { name: /When do you want to buy/ }).click();
await page.getByRole("option", { name: "Within a month" }).click();
await page.getByRole("button", { name: "Request a viewing" }).click();
check("viewing request accepted", await visible(page.getByText("Request sent for Turul Villa")));

// Owners: live estimate + valuation lead
await page.goto(`${BASE}/owners`, { waitUntil: "networkidle" });
const est = page.getByTestId("estimate-mid");
const rentVal = Number(await est.getAttribute("data-value"));
check("rent estimate shown", rentVal > 0, `€${rentVal}`);
await page.getByRole("radio", { name: "Sell it" }).click();
await page.waitForTimeout(300);
const saleVal = Number(await est.getAttribute("data-value"));
check("sale estimate larger than rent", saleVal > rentVal * 50, `€${saleVal}`);
await page.locator("#o-name").fill("Péter Nagy");
await page.locator("#o-email").fill("peter@example.com");
await page.getByRole("combobox", { name: "When is it available?" }).click();
await page.getByRole("option", { name: "Now" }).click();
await page.getByRole("button", { name: "Get my free valuation" }).click();
check("valuation request accepted", await visible(page.getByText(/Thank you. Expect a call/)));

// Other pages
for (const [path, name] of [["/team", /portal/], ["/pitch", /better/], ["/legal", /Privacy and terms/]]) {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  check(`${path} renders`, await visible(page.getByRole("heading", { level: 1, name })));
}
res = await page.goto(`${BASE}/property/does-not-exist`, { waitUntil: "networkidle" });
check("custom 404", res.status() === 404 && (await visible(page.getByText("already"))));

// Mobile: no overflow, full-height menu
const m = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on("pageerror", (e) => errors.push(e.message));
await m.goto(BASE, { waitUntil: "networkidle" });
check("mobile has no horizontal overflow", (await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 0);
check("mobile primary action in first screen", await m.getByRole("link", { name: /Homes to rent/ }).first().evaluate((el) => el.getBoundingClientRect().bottom < window.innerHeight));
await m.getByRole("button", { name: "Open menu" }).click();
check("mobile menu opens", await visible(m.locator("#mobile-menu").getByRole("link", { name: "Owners" })));

// Reduced motion still shows everything
const r = await browser.newPage({ reducedMotion: "reduce" });
await r.goto(BASE, { waitUntil: "networkidle" });
check("reduced motion: tagline fully visible", (await r.locator(".tag-word").first().evaluate((el) => getComputedStyle(el).opacity)) === "1");

check("no page errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
