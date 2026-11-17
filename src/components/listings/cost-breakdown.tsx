import type { Listing } from "@/lib/types";
import { monthlyCost } from "@/lib/cost";
import { formatEurApprox, formatHuf } from "@/lib/format";

/** The one number tenants need, built from the lines landlords usually split across the ad. */
export function CostBreakdown({ listing }: { listing: Listing }) {
  const c = monthlyCost(listing);
  const rows: [string, number | null][] = [
    ["Rent", c.rent],
    ["Common charge", c.commonCharge],
    ["Utilities (avg.)", c.utilities],
  ];
  return (
    <div className="tile p-5" aria-labelledby="cost-h">
      <p id="cost-h" className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Real monthly cost</p>
      <p className="display num mt-3 text-6xl text-accent" data-testid="total-cost">
        {formatHuf(c.total)}
        {c.partial && <span className="text-muted">+</span>}
      </p>
      <p className="num text-sm text-muted">{formatEurApprox(c.total)} / month</p>
      <dl className="mt-5 space-y-2.5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4">
            <dt className="text-muted">{k}</dt>
            <dd className="num">{v == null ? <span className="text-muted-2">ask us</span> : formatHuf(v)}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted">To move in</span>
          <span className="num font-medium">
            {c.moveIn.total != null ? formatHuf(c.moveIn.total) : "ask us"}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-2">
          {listing.depositMonths != null
            ? `${listing.depositMonths} months' deposit + first month's rent and fees.`
            : "Deposit not stated in the ad; we confirm it with the owner."}
          {c.partial && " Lines marked “ask us” weren't in the owner's ad; we confirm them before you view."}
        </p>
      </div>
    </div>
  );
}
