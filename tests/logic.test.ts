import { describe, expect, it } from "vitest";
import { listings } from "@/data/listings";
import { agents } from "@/data/agents";
import { testimonials } from "@/data/agency";
import { bedsLabel, districtNumber, formatEur, formatEurShort, headline } from "@/lib/format";
import { buildListingQuery, filtersToSearch, kindPath, parseFilters } from "@/lib/listing-query";
import { estimateValue } from "@/lib/estimate";
import { scoreValuation, scoreViewing } from "@/lib/lead-score";
import { leadSchema } from "@/lib/validation";
import { createRateLimiter } from "@/lib/rate-limit";

describe("listing data", () => {
  it("has unique ids and slugs, and every listing has photos and a known agent", () => {
    expect(new Set(listings.map((l) => l.id)).size).toBe(listings.length);
    expect(new Set(listings.map((l) => l.slug)).size).toBe(listings.length);
    const slugs = new Set(agents.map((a) => a.slug));
    for (const l of listings) {
      expect(l.photos.length).toBeGreaterThan(0);
      expect(l.priceEur).toBeGreaterThan(0);
      if (l.agent) expect(slugs.has(l.agent)).toBe(true);
    }
  });
  it("covers both rentals and sales", () => {
    expect(listings.some((l) => l.kind === "rent")).toBe(true);
    expect(listings.some((l) => l.kind === "sale")).toBe(true);
  });
  it("keeps testimonials as published (none invented)", () => {
    expect(testimonials).toHaveLength(3);
    expect(testimonials.map((t) => t.name)).toEqual(["Daniel", "Dalma", "Rick & Michelle"]);
  });
});

describe("format", () => {
  it("formats euros", () => {
    expect(formatEur(1234567)).toBe("€1,234,567");
    expect(formatEurShort(1_250_000)).toBe("€1.25M");
    expect(formatEurShort(890_400)).toBe("€890k");
  });
  it("labels beds, districts and headlines", () => {
    expect(bedsLabel(0)).toBe("Studio");
    expect(bedsLabel(2)).toBe("2 beds");
    expect(districtNumber("XII")).toBe(12);
    expect(headline({ type: "apartment", bedrooms: 3, view: "Panoramic", sizeM2: 126 })).toBe("3 bedroom apartment with panoramic view, 126 m²");
    expect(headline({ type: "house", bedrooms: 0, view: "Street", sizeM2: 300 })).toBe("house, 300 m²");
    expect(headline({ type: "house", bedrooms: 6, view: "Buda Hills", sizeM2: 290 })).toBe("6 bedroom house with Buda Hills view, 290 m²");
  });
});

describe("listing query", () => {
  it("parses only valid filters from the URL", () => {
    const f = parseFilters("rent", { district: "VI", maxPrice: "2000", beds: "2", type: "house", view: "Panoramic", furnished: "1", sort: "price-asc" });
    expect(f).toMatchObject({ kind: "rent", district: "VI", maxPrice: 2000, minBedrooms: 2, type: "house", view: "Panoramic", furnished: true, sort: "price-asc" });
    const bad = parseFilters("sale", { district: "'; drop table", maxPrice: "-5", type: "castle", view: "Moon", sort: "evil" });
    expect(bad).toEqual({ kind: "sale", district: undefined, maxPrice: undefined, minBedrooms: undefined, type: undefined, view: undefined, furnished: undefined, pets: undefined, garage: undefined, sort: undefined });
  });
  it("builds parameterised SQL", () => {
    const { sql, params } = buildListingQuery({ kind: "sale", district: "V", maxPrice: 900000, sort: "price-desc" });
    expect(params).toEqual(["sale", "V", 900000]);
    expect(sql).toContain("l.district = $2");
    expect(sql).toContain("l.price_eur <= $3");
    expect(sql).toContain("order by l.price_eur desc");
  });
  it("round-trips filters through the URL", () => {
    const f = { kind: "rent" as const, district: "II", pets: true, sort: "size-desc" as const };
    const qs = filtersToSearch(f);
    expect(qs).toBe("?district=II&pets=1&sort=size-desc");
    expect(parseFilters("rent", Object.fromEntries(new URLSearchParams(qs)))).toMatchObject(f);
    expect(kindPath("sale")).toBe("/buy");
  });
});

describe("estimate", () => {
  it("uses same-district comparables when there are enough", () => {
    const e = estimateValue({ kind: "sale", district: "VI", sizeM2: 120, bedrooms: 3, view: "standard", condition: "good" }, listings);
    expect(e.basis).toBe("district");
    expect(e.low).toBeLessThan(e.mid);
    expect(e.mid).toBeLessThan(e.high);
    expect(e.mid % 5000).toBe(0);
  });
  it("falls back to the same side of the river, rounds rents to €50", () => {
    const e = estimateValue({ kind: "rent", district: "III", sizeM2: 90, bedrooms: 2, view: "standard", condition: "good" }, listings);
    expect(["zone", "all"]).toContain(e.basis);
    expect(e.mid % 50).toBe(0);
  });
  it("prices a premium view and new build above a dated standard one", () => {
    const base = { kind: "rent" as const, district: "V", sizeM2: 100, bedrooms: 2 };
    const hi = estimateValue({ ...base, view: "premium", condition: "new" }, listings);
    const lo = estimateValue({ ...base, view: "standard", condition: "dated" }, listings);
    expect(hi.mid).toBeGreaterThan(lo.mid);
  });
});

describe("lead scoring", () => {
  it("rates a ready, funded, reachable relocating tenant hot", () => {
    const s = scoreViewing({ timing: "now", budgetEur: 3000, phone: "+36 20 123 4567", relocating: true, message: "Moving with my family in March, need a lift." }, { kind: "rent", priceEur: 2800 });
    expect(s.tier).toBe("hot");
    expect(s.score).toBeLessThanOrEqual(100);
  });
  it("rates a browsing, email-only visitor cold", () => {
    expect(scoreViewing({ timing: "browsing", budgetEur: 500, phone: undefined, relocating: false }, { kind: "rent", priceEur: 2800 }).tier).toBe("cold");
  });
  it("scores owners by readiness and district", () => {
    const hot = scoreValuation({ goal: "rent", district: "V", sizeM2: 130, readiness: "now", wantsManagement: true, phone: "+3612345678", view: "premium" });
    const cold = scoreValuation({ goal: "rent", district: "XIV", sizeM2: 40, readiness: "exploring", wantsManagement: false, phone: undefined, view: "standard" });
    expect(hot.tier).toBe("hot");
    expect(cold.tier).toBe("cold");
  });
});

describe("validation", () => {
  const viewing = { kind: "viewing", listingId: "rent-104713", name: "Anna Kovács", email: "Anna@Example.com", timing: "1m", relocating: false };
  it("accepts a valid viewing and normalises email", () => {
    const r = leadSchema.safeParse(viewing);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("anna@example.com");
  });
  it("rejects bad listing ids, emails and missing timing", () => {
    expect(leadSchema.safeParse({ ...viewing, listingId: "1; drop" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...viewing, email: "nope" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...viewing, timing: undefined }).success).toBe(false);
  });
  it("validates valuations", () => {
    const ok = { kind: "valuation", goal: "sale", name: "Péter Nagy", email: "p@n.hu", district: "XII", sizeM2: 140, bedrooms: 3, view: "premium", condition: "renovated", readiness: "soon" };
    expect(leadSchema.safeParse(ok).success).toBe(true);
    expect(leadSchema.safeParse({ ...ok, sizeM2: 10 }).success).toBe(false);
    expect(leadSchema.safeParse({ ...ok, district: "Z" }).success).toBe(false);
  });
});

describe("rate limit", () => {
  it("allows the limit then blocks", () => {
    const allow = createRateLimiter({ limit: 2, windowMs: 60_000 });
    expect([allow("a"), allow("a"), allow("a"), allow("b")]).toEqual([true, true, false, true]);
  });
});
