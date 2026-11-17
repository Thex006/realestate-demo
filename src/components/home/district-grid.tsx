import Link from "next/link";
import { agency } from "@/data/agency";
import { districtNumber, formatHufShort } from "@/lib/format";
import type { Listing } from "@/lib/types";

/** Districts as a strict grid of squares: count of live flats and the cheapest rent in each. */
export function DistrictGrid({ listings }: { listings: Listing[] }) {
  const by = new Map<string, Listing[]>();
  for (const l of listings) by.set(l.district, [...(by.get(l.district) ?? []), l]);
  const rows = [...by.entries()].sort((a, b) => districtNumber(a[0]) - districtNumber(b[0]));
  const focus = new Set<string>(agency.focusDistricts);
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
      {rows.map(([d, ls]) => (
        <li key={d}>
          <Link
            href={`/rentals?district=${d}`}
            className="group flex aspect-square flex-col justify-between rounded-xl border border-border bg-card-2 p-3 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/60"
          >
            <span className="flex items-start justify-between">
              <span className="text-2xl font-semibold tracking-[-0.04em] group-hover:text-accent">{d}</span>
              {focus.has(d) && <span className="mt-1.5 size-1.5 rounded-full bg-accent" aria-label="Focus district" />}
            </span>
            <span className="num text-[11px] leading-tight text-muted">
              {ls.length} {ls.length === 1 ? "flat" : "flats"}
              <br />
              from {formatHufShort(Math.min(...ls.map((l) => l.rentHuf)))}
            </span>
          </Link>
        </li>
      ))}
      {rows.length % 12 !== 0 && (
        <li>
          <Link
            href="/rentals"
            className="group flex aspect-square flex-col justify-between rounded-xl border border-dashed border-border-strong p-3 transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/60"
          >
            <span className="text-2xl font-semibold tracking-[-0.04em] group-hover:text-accent">All</span>
            <span className="num text-[11px] leading-tight text-muted">{listings.length} flats<br />every district</span>
          </Link>
        </li>
      )}
    </ul>
  );
}
