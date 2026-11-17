import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Listing } from "@/lib/types";
import { monthlyCost } from "@/lib/cost";
import { availabilityLabel, formatHuf, furnishedLabel, roomsLabel } from "@/lib/format";
import { ListingPhoto } from "./listing-photo";

export function ListingCard({ listing, priority = false }: { listing: Listing; priority?: boolean }) {
  const cost = monthlyCost(listing);
  return (
    <Link
      href={`/rentals/${listing.slug}`}
      className="tile group flex h-full flex-col transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-border-strong"
      data-testid="listing-card"
    >
      <ListingPhoto src={listing.imageUrl} alt={listing.title} district={listing.district} className="aspect-[4/3]" priority={priority} />
      <span className="absolute left-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
        {listing.district} · {listing.neighbourhood}
      </span>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[15px] font-medium leading-snug">{listing.title}</h3>
          <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" />
        </div>
        <p className="text-xs text-muted">
          {listing.street} · {listing.sizeM2} m² · {roomsLabel(listing)} · {furnishedLabel[listing.furnished]}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
          <div>
            <p className="num text-lg font-semibold tracking-[-0.02em]">{formatHuf(listing.rentHuf)}</p>
            <p className="num text-[11px] text-muted-2">
              {cost.total > cost.rent ? `${formatHuf(cost.total)}${cost.partial ? "+" : ""} with fees` : "fees on request"}
            </p>
          </div>
          <span className={`text-[11px] ${listing.availableNow ? "text-ok" : "text-muted"}`}>{availabilityLabel(listing)}</span>
        </div>
      </div>
    </Link>
  );
}
