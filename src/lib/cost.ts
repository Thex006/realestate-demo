import type { Listing } from "./types";

export interface MonthlyCost {
  rent: number;
  commonCharge: number | null;
  utilities: number | null;
  /** rent + every cost the landlord disclosed */
  total: number;
  /** true when a cost line is unknown, so the total is a floor, not the full figure */
  partial: boolean;
  moveIn: { deposit: number | null; firstMonth: number; total: number | null };
}

/** The number tenants actually budget for: rent plus the fees most portals bury in the text. */
export function monthlyCost(l: Pick<Listing, "rentHuf" | "commonChargeHuf" | "utilitiesEstHuf" | "depositMonths">): MonthlyCost {
  const total = l.rentHuf + (l.commonChargeHuf ?? 0) + (l.utilitiesEstHuf ?? 0);
  const deposit = l.depositMonths != null ? l.depositMonths * l.rentHuf : null;
  return {
    rent: l.rentHuf,
    commonCharge: l.commonChargeHuf,
    utilities: l.utilitiesEstHuf,
    total,
    partial: l.commonChargeHuf == null || l.utilitiesEstHuf == null,
    moveIn: { deposit, firstMonth: total, total: deposit != null ? deposit + total : null },
  };
}

export const pricePerM2 = (l: Pick<Listing, "rentHuf" | "sizeM2">) => Math.round(l.rentHuf / l.sizeM2);
