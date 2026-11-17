import { describe, expect, it } from "vitest";
import { listings } from "@/data/listings";
import { monthlyCost } from "@/lib/cost";
import { estimateRent } from "@/lib/estimate";
import { scoreOwner, scoreViewing } from "@/lib/lead-score";
import { buildListingQuery, filtersToSearch, parseFilters } from "@/lib/listing-query";
import { availabilityLabel, formatHuf, formatHufShort, roomsLabel } from "@/lib/format";
import { leadSchema } from "@/lib/validation";

const bySlug = (s: string) => listings.find((l) => l.slug === s)!;

describe("seed data", () => {
  it("has unique ids, slugs and refs", () => {
    for (const key of ["id", "slug", "externalRef"] as const) {
      expect(new Set(listings.map((l) => l[key])).size).toBe(listings.length);
    }
  });
  it("every listing links back to its public source ad", () => {
    for (const l of listings) expect(l.sourceUrl).toMatch(/^https:\/\/en\.alberlet\.hu\/kiado-alberlet\//);
  });
});

describe("monthlyCost", () => {
  it("adds rent, common charge and utilities", () => {
    const c = monthlyCost(bySlug("frankel-leo-ut-129m2-ii"));
    expect(c.total).toBe(438_000 + 47_472 + 35_000);
    expect(c.partial).toBe(false);
  });
  it("flags a partial total when a line is unknown and computes move-in", () => {
    const c = monthlyCost(bySlug("vadasz-utca-50m2-v"));
    expect(c.partial).toBe(true);
    expect(c.moveIn.deposit).toBe(640_000);
    expect(c.moveIn.total).toBe(640_000 + 355_000);
  });
});

describe("estimateRent", () => {
  const base = { district: "VI", sizeM2: 45, furnished: "furnished", condition: "renovated", elevator: true, balcony: false } as const;
  it("lands near the agency's own District VI rents", () => {
    const e = estimateRent(base, listings);
    expect(e.basis).toBe("zone"); // only 2 flats in VI, so it widens to the inner-Pest zone
    expect(e.mid).toBeGreaterThan(220_000);
    expect(e.mid).toBeLessThan(330_000);
    expect(e.low).toBeLessThan(e.mid);
    expect(e.high).toBeGreaterThan(e.mid);
  });
  it("rises with size, condition and furnishing", () => {
    const small = estimateRent(base, listings).mid;
    expect(estimateRent({ ...base, sizeM2: 90 }, listings).mid).toBeGreaterThan(small);
    expect(estimateRent({ ...base, condition: "dated" }, listings).mid).toBeLessThan(small);
    expect(estimateRent({ ...base, furnished: "unfurnished" }, listings).mid).toBeLessThan(small);
  });
  it("ignores houses as comparables", () => {
    const e = estimateRent({ ...base, district: "II", sizeM2: 120 }, listings);
    expect(e.mid).toBeLessThan(1_000_000);
  });
});

describe("lead scoring", () => {
  const flat = bySlug("szent-istvan-korut-95m2-v");
  it("scores an ideal tenant hot", () => {
    const s = scoreViewing({ moveIn: "asap", leaseMonths: 24, occupants: 2, pets: false, budgetHuf: 500_000, phone: "+36301234567" }, flat);
    expect(s.tier).toBe("hot");
    expect(s.score).toBe(100);
  });
  it("penalises pets where the owner said no", () => {
    const ok = scoreViewing({ moveIn: "1m", leaseMonths: 12, occupants: 1, pets: false, budgetHuf: undefined, phone: undefined }, flat);
    const pets = scoreViewing({ moveIn: "1m", leaseMonths: 12, occupants: 1, pets: true, budgetHuf: undefined, phone: undefined }, flat);
    expect(ok.score - pets.score).toBe(25);
  });
  it("scores a vague tenant cold", () => {
    const s = scoreViewing({ moveIn: "later", leaseMonths: 6, occupants: 1, pets: false, budgetHuf: 150_000, phone: undefined }, flat);
    expect(s.tier).toBe("cold");
  });
  it("scores a ready focus-district owner wanting management hot", () => {
    const s = scoreOwner({ district: "VII", sizeM2: 85, readiness: "now", wantsManagement: true, furnished: "furnished", condition: "renovated", phone: "+36 30 000 0000" });
    expect(s).toMatchObject({ score: 100, tier: "hot" });
  });
  it("scores an exploring outer-district owner cold", () => {
    expect(scoreOwner({ district: "XV", sizeM2: 40, readiness: "exploring", wantsManagement: false, furnished: "unfurnished", condition: "dated", phone: undefined }).tier).toBe("cold");
  });
});

describe("listing query", () => {
  it("parses and drops unsafe values", () => {
    expect(parseFilters({ district: "V'; drop table", maxRent: "abc", furnished: "gold", sort: "x" })).toEqual({
      district: undefined, maxRent: undefined, minRooms: undefined, minSize: undefined, furnished: undefined, pets: undefined, sort: undefined,
    });
  });
  it("builds parameterised SQL", () => {
    const q = buildListingQuery({ district: "V", maxRent: 300_000, pets: true, sort: "price-asc" });
    expect(q.sql).toContain("district = $1");
    expect(q.sql).toContain("rent_huf <= $2");
    expect(q.sql).toContain("pets_allowed is distinct from false");
    expect(q.sql).toMatch(/order by rent_huf asc/);
    expect(q.params).toEqual(["V", 300_000]);
  });
  it("round-trips through the URL", () => {
    const f = { district: "XI", minRooms: 2, furnished: "unfurnished" as const };
    expect(parseFilters(Object.fromEntries(new URLSearchParams(filtersToSearch(f))))).toMatchObject(f);
  });
});

describe("format", () => {
  it("formats forint deterministically", () => {
    expect(formatHuf(1_642_000)).toBe("1,642,000 Ft");
    expect(formatHufShort(190_000)).toBe("190k Ft");
    expect(formatHufShort(1_642_000)).toBe("1.64M Ft");
  });
  it("labels rooms and availability", () => {
    expect(roomsLabel(bySlug("veres-palne-utca-52m2-v"))).toBe("2 rooms + 1 half");
    expect(roomsLabel(bySlug("akacfa-utca-31m2-vii"))).toBe("Studio");
    expect(availabilityLabel({ availableNow: false, availableFrom: "2026-12-01" }, new Date("2026-11-17"))).toBe("From 1 Dec");
    expect(availabilityLabel({ availableNow: false, availableFrom: "2026-10-01" }, new Date("2026-11-17"))).toBe("Available now");
  });
});

describe("validation", () => {
  it("accepts a complete owner lead and rejects a bad email", () => {
    const ok = leadSchema.safeParse({ kind: "owner", name: "Anna Kiss", email: "anna@example.com", district: "VI", sizeM2: 55, furnished: "furnished", condition: "good", readiness: "now" });
    expect(ok.success).toBe(true);
    const bad = leadSchema.safeParse({ kind: "owner", name: "Anna", email: "nope", district: "VI", sizeM2: 55, furnished: "furnished", condition: "good", readiness: "now" });
    expect(bad.success).toBe(false);
  });
  it("requires move-in timing on viewing requests", () => {
    const r = leadSchema.safeParse({ kind: "viewing", listingId: listings[0].id, name: "Ben", email: "ben@example.com", leaseMonths: 12, occupants: 1 });
    expect(r.success).toBe(false);
  });
});
