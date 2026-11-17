import Link from "next/link";
import type { Listing } from "@/lib/types";
import { bedsLabel, formatEur, headline } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Photo } from "./photo";

/**
 * Photo-first card. On hover the second photo cross-fades in (opacity only) while the frame
 * pushes in 3%, so a browse feels like flicking through the flat.
 */
export function ListingCard({ listing, size = "md", priority = false }: { listing: Listing; size?: "md" | "lg"; priority?: boolean }) {
  const [a, b] = listing.photos;
  return (
    <Link href={`/property/${listing.slug}`} className="group block" data-testid="listing-card">
      <div className={cn("relative overflow-hidden rounded-md bg-card-2", size === "lg" ? "aspect-[4/5] lg:aspect-auto lg:h-full lg:min-h-[640px]" : "aspect-[4/3]")}>
        <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]">
          {a && <Photo src={a} alt={`${listing.street}, District ${listing.district}`} priority={priority} />}
          {b && <Photo src={b} alt="" className="opacity-0 transition-opacity duration-700 group-hover:opacity-100" />}
        </div>
        <div className="absolute left-4 right-4 top-4 flex items-start justify-between gap-2 caption-3 tracking-[0.08em] text-white">
          <span className="rounded-full bg-black/45 px-3 py-1 backdrop-blur-md">DISTRICT {listing.district}</span>
          <span className="num rounded-full bg-black/45 px-3 py-1 backdrop-blur-md">{listing.photos.length} PHOTOS</span>
        </div>
        <div className="absolute bottom-4 left-4 rounded-full bg-black/55 px-3 py-1 text-white backdrop-blur-md">
          <p className="num title-2">
            {formatEur(listing.priceEur)}
            {listing.kind === "rent" && <span className="body-6 text-white/70"> / month</span>}
          </p>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className={cn("transition-colors duration-300 group-hover:text-accent", size === "lg" ? "heading-4" : "heading-5")}>{listing.street}</h3>
          <p className="mt-1 caption-2 text-muted">{headline(listing)}</p>
        </div>
        <p className="num shrink-0 pt-1 text-right caption-5 text-muted-2">
          {bedsLabel(listing.bedrooms)}<br />{listing.bathrooms} bath
        </p>
      </div>
    </Link>
  );
}
