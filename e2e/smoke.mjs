// End-to-end smoke test against a running server.
// Usage: npm run build && npm start      (terminal 1)
//        npm run test:e2e [baseUrl]      (terminal 2; needs `npx playwright install chromium` once)
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
let failed = 0;
const visible = (loc) => loc.first().waitFor({ state: "visible", timeout: 5000 }).then(() => true, () => false);
const check = (name, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));

// Home
let res = await page.goto(BASE, { waitUntil: "networkidle" });
check("home 200", res.status() === 200);
check("noindex header", (res.headers()["x-robots-tag"] ?? "").includes("noindex"));
check("noindex meta", (await page.locator('meta[name="robots"]').getAttribute("content"))?.includes("noindex"));
check("concept note visible", await page.getByText("Concept redesign by").first().isVisible());

// Search from hero -> filtered results
await page.getByRole("combobox", { name: "District" }).click();
await page.getByRole("option", { name: "District V", exact: true }).click();
await page.getByRole("button", { name: "Show flats" }).click();
await page.waitForURL(/\/rentals\?district=V/);
const count = await page.getByTestId("listing-card").count();
check("hero search filters to District V", count === 4, `${count} cards`);

// Filters via URL
await page.goto(`${BASE}/rentals?maxRent=250000`, { waitUntil: "networkidle" });
const cheap = await page.getByTestId("listing-card").count();
check("budget filter", cheap === 7, `${cheap} cards`);

// Listing detail + viewing request
await page.goto(`${BASE}/rentals/frankel-leo-ut-129m2-ii`, { waitUntil: "networkidle" });
check("detail shows all-in cost", (await page.getByTestId("total-cost").innerText()).includes("520,472"));
await page.getByRole("button", { name: "Request a viewing" }).click();
check("empty viewing form shows errors", await visible(page.getByText("Tell us your name")));
await page.fill("#v-name", "Smoke Test");
await page.fill("#v-email", "smoke@example.com");
await page.fill("#v-phone", "+36 30 000 0000");
await page.locator("#v-move").click();
await page.getByRole("option", { name: "As soon as possible" }).click();
await page.getByRole("button", { name: "Request a viewing" }).click();
check("viewing request stored", await visible(page.getByText("Request received for Frankel Leó út")));

// Owner estimate + lead
await page.goto(`${BASE}/owners`, { waitUntil: "networkidle" });
const before = await page.getByTestId("estimate-mid").innerText();
await page.getByRole("slider").focus();
for (let i = 0; i < 30; i++) await page.keyboard.press("ArrowRight");
const after = await page.getByTestId("estimate-mid").innerText();
check("estimate reacts to size", before !== after, `${before} -> ${after}`);
await page.fill("#o-name", "Owner Test");
await page.fill("#o-email", "owner@example.com");
await page.locator("#o-ready").click();
await page.getByRole("option", { name: "It's empty now" }).click();
await page.getByRole("button", { name: "Get my call-back" }).click();
check("owner lead stored", await visible(page.getByText("Expect a call")));

// Agent + 404
res = await page.goto(`${BASE}/team/monika-stark`);
check("agent profile 200", res.status() === 200);
res = await page.goto(`${BASE}/rentals/does-not-exist`);
check("unknown flat 404", res.status() === 404);

// Mobile: no horizontal scroll
const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
for (const p of ["/", "/rentals", "/owners", "/rentals/vadasz-utca-50m2-v"]) {
  await m.goto(BASE + p, { waitUntil: "networkidle" });
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`mobile ${p} no sideways scroll`, overflow <= 0, `${overflow}px`);
}

check("no page errors", errors.length === 0, errors.join(" | "));
await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
