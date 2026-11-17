import type { Listing } from "./types";
import type { ValuationLead, ViewingLead } from "./validation";

export type Tier = "hot" | "warm" | "cold";
export interface ScorePart { key: string; points: number; note: string }
export interface LeadScore { score: number; tier: Tier; breakdown: ScorePart[] }

const finish = (breakdown: ScorePart[]): LeadScore => {
  const score = Math.max(0, Math.min(100, Math.round(breakdown.reduce((a, p) => a + p.points, 0))));
  return { score, tier: score >= 70 ? "hot" : score >= 45 ? "warm" : "cold", breakdown };
};

/** Viewing request: soon, able to pay, reachable, relocating (corporate tenants) = hot. Max 100. */
export function scoreViewing(lead: Pick<ViewingLead, "timing" | "budgetEur" | "phone" | "relocating" | "message">, listing: Pick<Listing, "kind" | "priceEur">): LeadScore {
  const p: ScorePart[] = [];
  p.push({ key: "timing", points: { now: 35, "1m": 28, "3m": 15, browsing: 4 }[lead.timing], note: `Timing: ${lead.timing}` });
  if (lead.budgetEur == null) p.push({ key: "budget", points: 10, note: "No budget given" });
  else if (lead.budgetEur >= listing.priceEur) p.push({ key: "budget", points: 30, note: "Budget covers the price" });
  else if (lead.budgetEur >= listing.priceEur * 0.9) p.push({ key: "budget", points: 18, note: "Within 10% of the price" });
  else p.push({ key: "budget", points: 0, note: "Budget below the price" });
  p.push(lead.phone ? { key: "contact", points: 15, note: "Phone given" } : { key: "contact", points: 0, note: "Email only" });
  p.push(lead.relocating ? { key: "relocation", points: 15, note: "Relocating for work" } : { key: "relocation", points: 0, note: "Not relocating" });
  p.push(lead.message && lead.message.length > 20 ? { key: "intent", points: 5, note: "Wrote a real message" } : { key: "intent", points: 0, note: "No message" });
  return finish(p);
}

/** Owner valuation: ready, large, prime district, wants management = hot. Max 100. */
export function scoreValuation(lead: Pick<ValuationLead, "goal" | "district" | "sizeM2" | "readiness" | "wantsManagement" | "phone" | "view">): LeadScore {
  const p: ScorePart[] = [];
  const prime = ["I", "II", "V", "VI", "XII"].includes(lead.district);
  p.push({ key: "district", points: prime ? 20 : 10, note: prime ? `District ${lead.district} is prime` : `District ${lead.district}` });
  p.push({ key: "size", points: lead.sizeM2 >= 120 ? 20 : lead.sizeM2 >= 80 ? 14 : 8, note: `${lead.sizeM2} m²` });
  p.push({ key: "readiness", points: { now: 25, soon: 16, exploring: 4 }[lead.readiness], note: `Ready: ${lead.readiness}` });
  p.push(lead.goal === "rent" && lead.wantsManagement ? { key: "management", points: 15, note: "Wants management" } : { key: "management", points: lead.goal === "sale" ? 10 : 0, note: lead.goal === "sale" ? "Sale commission" : "Letting only" });
  p.push({ key: "view", points: lead.view === "premium" ? 5 : 0, note: `${lead.view} view` });
  p.push(lead.phone ? { key: "contact", points: 15, note: "Phone given" } : { key: "contact", points: 0, note: "Email only" });
  return finish(p);
}
