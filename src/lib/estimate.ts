import type { Furnished, Listing } from "./types";

export interface EstimateInput {
  district: string;
  sizeM2: number;
  furnished: Furnished;
  condition: "new" | "renovated" | "good" | "dated";
  elevator: boolean;
  balcony: boolean;
}

export interface Estimate {
  low: number;
  mid: number;
  high: number;
  perM2: number;
  comparables: number;
  basis: "district" | "zone" | "all";
}

/** Inner Pest and central Buda behave as one market; the outer districts as another. */
const ZONES: Record<string, "core" | "buda" | "outer"> = {
  V: "core", VI: "core", VII: "core", VIII: "core", IX: "core", XIII: "core",
  I: "buda", II: "buda", III: "buda", XI: "buda", XII: "buda",
  IV: "outer", X: "outer", XIV: "outer", XV: "outer",
};
export const zoneOf = (d: string) => ZONES[d] ?? "outer";

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const CONDITION = { new: 1.08, renovated: 1.03, good: 1, dated: 0.9 } as const;
const FURNISHED = { furnished: 1.05, partly: 1.0, unfurnished: 0.95 } as const;

/**
 * Rent estimate built only from the agency's own live listings, so the number an owner sees is
 * grounded in what Lakáspont is actually letting today. Larger flats rent for less per m², so the
 * per-m² rate is scaled by size relative to the comparables' median size.
 */
export function estimateRent(input: EstimateInput, pool: Pick<Listing, "district" | "sizeM2" | "rentHuf" | "propertyType">[]): Estimate {
  const flats = pool.filter((l) => l.propertyType !== "house");
  let comps = flats.filter((l) => l.district === input.district);
  let basis: Estimate["basis"] = "district";
  if (comps.length < 3) {
    comps = flats.filter((l) => zoneOf(l.district) === zoneOf(input.district));
    basis = "zone";
  }
  if (comps.length < 3) {
    comps = flats;
    basis = "all";
  }
  const basePerM2 = median(comps.map((l) => l.rentHuf / l.sizeM2));
  const refSize = median(comps.map((l) => l.sizeM2));
  const size = Math.min(Math.max(input.sizeM2, 15), 400);
  // Elasticity: double the size -> roughly 20% less per m².
  const sizeFactor = Math.pow(size / refSize, -0.32);
  const factor =
    sizeFactor * CONDITION[input.condition] * FURNISHED[input.furnished] * (input.elevator ? 1.02 : 1) * (input.balcony ? 1.03 : 1);
  const perM2 = basePerM2 * factor;
  const mid = roundTo(perM2 * size, 5000);
  const spread = basis === "district" ? 0.08 : 0.12;
  return {
    low: roundTo(mid * (1 - spread), 5000),
    mid,
    high: roundTo(mid * (1 + spread), 5000),
    perM2: Math.round(perM2),
    comparables: comps.length,
    basis,
  };
}

const roundTo = (n: number, step: number) => Math.round(n / step) * step;
