import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Listing } from "@/lib/types";
import { monthlyCost } from "@/lib/cost";
import { availabilityLabel, formatHuf, furnishedLabel, roomsLabel } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ListingPhoto } from "./listing-photo";

export function ListingCard({ listing, priority = false, tall = false }: { listing: Listing; priority?: boolean; tall?: boolean }) {
  const cost = monthlyCost(listing);
  return (
    <Link
      href={`/rentals/${listing.slug}`}
      className="group flex h-full flex-col gap-4 rounded-[var(--radius)] transition-transform duration-300 hover:-translate-y-0.5"
      data-testid="listing-card"
    >
      <div className="relative overflow-hidden rounded-[var(--radius)] border border-border">
        <ListingPhoto src={listing.imageUrl} alt={listing.title} seed={listing.slug} className={cn(tall ? "aspect-[4/5]" : "aspect-[5/4]")} priority={priority} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 to-transparent" aria-hidden />
        <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md">
          {listing.district} · {listing.neighbourhood}
        </span>
        {listing.availableNow && (
          <span className="absolute right-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-ink">Ready now</span>
        )}
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 text-white">
          <div>
            <p className="num text-xl font-semibold tracking-[-0.02em]">{formatHuf(listing.rentHuf)}</p>
            <p className="num text-[11px] text-white/70">
              {cost.total > cost.rent ? `${formatHuf(cost.total)}${cost.partial ? "+" : ""} all-in` : "fees on request"}
            </p>
          </div>
          <span className="grid size-9 place-items-center rounded-full bg-white/10 backdrop-blur-md transition-colors group-hover:bg-accent group-hover:text-accent-ink">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
      <div className="px-1">
        <h3 className="display text-[26px] leading-[1.05] transition-colors group-hover:text-accent">{listing.title}</h3>
        <p className="mt-2 text-xs text-muted">
          {listing.street} · {listing.sizeM2} m² · {roomsLabel(listing)} · {furnishedLabel[listing.furnished]}
          {!listing.availableNow && ` · ${availabilityLabel(listing)}`}
        </p>
      </div>
    </Link>
  );
}
