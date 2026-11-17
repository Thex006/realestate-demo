import { agency } from "@/data/agency";
import { monthlyCost } from "./cost";
import type { Listing } from "./types";
import type { OwnerLead, ViewingLead } from "./validation";

export type Tier = "hot" | "warm" | "cold";
export interface ScorePart {
  key: string;
  points: number;
  note: string;
}
export interface LeadScore {
  score: number;
  tier: Tier;
  breakdown: ScorePart[];
}

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const tierOf = (s: number): Tier => (s >= 70 ? "hot" : s >= 45 ? "warm" : "cold");
const finish = (breakdown: ScorePart[]): LeadScore => {
  const score = clamp(breakdown.reduce((a, p) => a + p.points, 0));
  return { score, tier: tierOf(score), breakdown };
};

/**
 * Tenant viewing request. A hot tenant can move soon, signs 12+ months, can afford the real
 * monthly cost and fits the flat. Max 100.
 */
export function scoreViewing(
  lead: Pick<ViewingLead, "moveIn" | "leaseMonths" | "occupants" | "pets" | "budgetHuf" | "phone">,
  listing: Pick<Listing, "rentHuf" | "commonChargeHuf" | "utilitiesEstHuf" | "depositMonths" | "rooms" | "halfRooms" | "petsAllowed">,
): LeadScore {
  const parts: ScorePart[] = [];
  const timing = { asap: 30, "1m": 24, "3m": 12, later: 4 }[lead.moveIn];
  parts.push({ key: "timing", points: timing, note: `Move-in: ${lead.moveIn}` });

  parts.push(
    lead.leaseMonths >= 12
      ? { key: "lease", points: lead.leaseMonths >= 24 ? 20 : 17, note: `${lead.leaseMonths}-month lease` }
      : { key: "lease", points: 4, note: "Short lease: most owners ask for 12 months" },
  );

  const total = monthlyCost(listing).total;
  if (lead.budgetHuf == null) parts.push({ key: "budget", points: 10, note: "Budget not given" });
  else if (lead.budgetHuf >= total) parts.push({ key: "budget", points: 25, note: "Budget covers rent + fees" });
  else if (lead.budgetHuf >= listing.rentHuf) parts.push({ key: "budget", points: 15, note: "Covers rent, tight on fees" });
  else if (lead.budgetHuf >= listing.rentHuf * 0.9) parts.push({ key: "budget", points: 6, note: "Within 10% of rent" });
  else parts.push({ key: "budget", points: 0, note: "Budget below rent" });

  const capacity = Math.max(1, listing.rooms + listing.halfRooms * 0.5) * 2;
  parts.push(
    lead.occupants <= capacity
      ? { key: "fit", points: 10, note: `${lead.occupants} occupant(s) fit` }
      : { key: "fit", points: 0, note: "More people than the flat suits" },
  );

  if (lead.pets && listing.petsAllowed === false) parts.push({ key: "pets", points: -20, note: "Has pets, owner says no pets" });
  else if (lead.pets && listing.petsAllowed == null) parts.push({ key: "pets", points: 0, note: "Has pets, owner to confirm" });
  else parts.push({ key: "pets", points: 5, note: "No pet conflict" });

  parts.push(lead.phone ? { key: "contact", points: 10, note: "Phone given" } : { key: "contact", points: 0, note: "Email only" });
  return finish(parts);
}

/**
 * Landlord asking for a rent estimate. Hot = in the agency's focus districts, ready to let now,
 * and open to ongoing management (recurring revenue). Max 100.
 */
export function scoreOwner(lead: Pick<OwnerLead, "district" | "sizeM2" | "readiness" | "wantsManagement" | "furnished" | "condition" | "phone">): LeadScore {
  const parts: ScorePart[] = [];
  const focus = (agency.focusDistricts as readonly string[]).includes(lead.district);
  parts.push(
    focus
      ? { key: "district", points: 25, note: `District ${lead.district} is a focus district` }
      : { key: "district", points: 8, note: `District ${lead.district} is outside the core patch` },
  );
  parts.push({ key: "size", points: lead.sizeM2 >= 80 ? 15 : lead.sizeM2 >= 45 ? 10 : 6, note: `${lead.sizeM2} m²` });
  parts.push({ key: "readiness", points: { now: 25, soon: 16, exploring: 4 }[lead.readiness], note: `Free: ${lead.readiness}` });
  parts.push(
    lead.wantsManagement
      ? { key: "management", points: 15, note: "Wants ongoing management" }
      : { key: "management", points: 0, note: "Letting only" },
  );
  parts.push({
    key: "condition",
    points: lead.condition === "new" || lead.condition === "renovated" ? 5 : lead.condition === "good" ? 3 : 0,
    note: `Condition: ${lead.condition}`,
  });
  parts.push({ key: "furnished", points: lead.furnished === "furnished" ? 5 : 2, note: lead.furnished });
  parts.push(lead.phone ? { key: "contact", points: 10, note: "Phone given" } : { key: "contact", points: 0, note: "Email only" });
  return finish(parts);
}
