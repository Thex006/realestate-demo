import type { Kind, Listing } from "./types";

export interface ValuationInput {
  kind: Kind;
  district: string;
  sizeM2: number;
  bedrooms: number;
  view: "premium" | "standard"; // Danube / panoramic / hills vs street / courtyard
  condition: "new" | "renovated" | "good" | "dated";
}

export interface Valuation {
  low: number;
  mid: number;
  high: number;
  perM2: number;
  comparables: number;
  basis: "district" | "zone" | "all";
}

const ZONE: Record<string, "pest" | "buda"> = { V: "pest", VI: "pest", VII: "pest", VIII: "pest", IX: "pest", XIII: "pest", XIV: "pest", I: "buda", II: "buda", III: "buda", XI: "buda", XII: "buda" };
export const zoneOf = (d: string) => ZONE[d] ?? "pest";
const PREMIUM_VIEWS = new Set(["Panoramic", "River Danube", "Buda Hills"]);

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const round = (n: number, step: number) => Math.round(n / step) * step;
const CONDITION = { new: 1.1, renovated: 1.04, good: 1, dated: 0.86 } as const;

/**
 * Estimate grounded only in the agency's own live listings of the same kind (rent or sale):
 * median €/m² of comparables, adjusted for view and condition, with size elasticity.
 */
export function estimateValue(input: ValuationInput, pool: Pick<Listing, "kind" | "district" | "sizeM2" | "priceEur" | "view">[]): Valuation {
  const same = pool.filter((l) => l.kind === input.kind);
  let comps = same.filter((l) => l.district === input.district);
  let basis: Valuation["basis"] = "district";
  if (comps.length < 3) {
    comps = same.filter((l) => zoneOf(l.district) === zoneOf(input.district));
    basis = "zone";
  }
  if (comps.length < 3) {
    comps = same;
    basis = "all";
  }
  const base = median(comps.map((l) => l.priceEur / l.sizeM2));
  const ref = median(comps.map((l) => l.sizeM2));
  const premiumShare = comps.filter((l) => l.view && PREMIUM_VIEWS.has(l.view)).length / comps.length;
  // Re-centre the median on a "standard view" flat, then apply the owner's view.
  const viewAdj = (input.view === "premium" ? 1.08 : 1) / (1 + 0.08 * premiumShare);
  const size = Math.min(Math.max(input.sizeM2, 25), 800);
  const perM2 = base * Math.pow(size / ref, -0.18) * viewAdj * CONDITION[input.condition];
  const step = input.kind === "rent" ? 50 : 5000;
  const mid = round(perM2 * size, step);
  const spread = basis === "district" ? 0.1 : 0.15;
  return { low: round(mid * (1 - spread), step), mid, high: round(mid * (1 + spread), step), perM2: Math.round(perM2), comparables: comps.length, basis };
}
