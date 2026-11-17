import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, MapPin, Phone } from "lucide-react";
import { getAgentById, getListingBySlug, searchListings } from "@/lib/db";
import { availabilityLabel, districtLabel, formatHuf, furnishedLabel, roomsLabel } from "@/lib/format";
import { pricePerM2 } from "@/lib/cost";
import { ListingPhoto } from "@/components/listings/listing-photo";
import { CostBreakdown } from "@/components/listings/cost-breakdown";
import { ListingCard } from "@/components/listings/listing-card";
import { ViewingForm } from "@/components/forms/viewing-form";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await getListingBySlug((await params).slug);
  return l ? { title: `${l.title}, ${districtLabel(l.district)}`, description: l.summary } : { title: "Flat not found" };
}

const yesNo = (v: boolean | null, yes = "Yes", no = "No") => (v == null ? "Ask us" : v ? yes : no);

export default async function ListingPage({ params }: Props) {
  const listing = await getListingBySlug((await params).slug);
  if (!listing) notFound();
  const [agent, sameArea] = await Promise.all([getAgentById(listing.agentId), searchListings({ district: listing.district })]);
  const similar = (sameArea.length > 1 ? sameArea : await searchListings({ maxRent: Math.round(listing.rentHuf * 1.25) }))
    .filter((l) => l.id !== listing.id)
    .slice(0, 3);

  const facts: [string, string][] = [
    ["Size", `${listing.sizeM2} m²`],
    ["Rooms", roomsLabel(listing)],
    ["Floor", listing.floor ?? "Ask us"],
    ["Lift", yesNo(listing.elevator)],
    ["Furnishing", furnishedLabel[listing.furnished]],
    ["Condition", listing.condition ?? "Ask us"],
    ["Heating", listing.heating ?? "Ask us"],
    ["Air conditioning", listing.airConditioning ? "Yes" : "Not listed"],
    ["Outdoor", listing.balcony ?? "None listed"],
    ["Parking", listing.parking ?? "Ask us"],
    ["Pets", yesNo(listing.petsAllowed, "Welcome", "Not allowed")],
    ["Minimum lease", listing.minLeaseMonths ? `${listing.minLeaseMonths} months` : "Ask us"],
  ];

  return (
    <div className="wrap pt-8">
      <Link href="/rentals" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="size-4" /> All rentals
      </Link>

      {/* Bento: photo | title + cost, then facts | form */}
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="tile enter lg:col-span-8">
          <ListingPhoto src={listing.imageUrl} alt={listing.title} district={listing.district} className="aspect-[16/10] h-full" priority />
          <span className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-medium ${listing.availableNow ? "bg-accent text-accent-ink" : "bg-background/80 backdrop-blur"}`}>
            {availabilityLabel(listing)}
          </span>
        </div>

        <div className="grid gap-4 lg:col-span-4">
          <div className="tile enter p-5" style={{ "--enter-delay": "80ms" } as React.CSSProperties}>
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-accent">
              <MapPin className="size-3.5" /> {districtLabel(listing.district)} · {listing.neighbourhood}
            </p>
            <h1 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.03em] md:text-[28px]">{listing.title}</h1>
            <p className="mt-2 text-sm text-muted">{listing.street}, Budapest {listing.district}.</p>
            <div className="num mt-5 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
              <Stat k="m²" v={String(listing.sizeM2)} />
              <Stat k="rooms" v={String(listing.rooms + listing.halfRooms * 0.5)} />
              <Stat k="Ft / m²" v={pricePerM2(listing).toLocaleString("en-US")} />
            </div>
          </div>
          <div className="enter" style={{ "--enter-delay": "140ms" } as React.CSSProperties}>
            <CostBreakdown listing={listing} />
          </div>
        </div>

        <section className="tile p-5 lg:col-span-7" aria-labelledby="about-h">
          <h2 id="about-h" className="text-lg font-semibold tracking-[-0.02em]">About this flat</h2>
          <p className="mt-2 leading-relaxed text-muted">{listing.summary}</p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {listing.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm">
                <Check className="size-4 text-accent" /> {h}
              </li>
            ))}
          </ul>
          <dl className="mt-6 grid gap-x-6 border-t border-border pt-5 text-sm sm:grid-cols-2">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-border py-2.5">
                <dt className="text-muted">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          {listing.nearby.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Nearby</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {listing.nearby.map((n) => (
                  <li key={n} className="rounded-full border border-border px-3 py-1 text-xs">{n}</li>
                ))}
              </ul>
            </div>
          )}
          {agent && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card-2 p-4">
              <div>
                <p className="text-xs text-muted">Your contact</p>
                <Link href={`/team/${agent.slug}`} className="font-medium hover:text-accent">{agent.name}</Link>
                <p className="text-xs text-muted">{agent.role}</p>
              </div>
              <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="num inline-flex items-center gap-2 text-sm hover:text-accent">
                <Phone className="size-4" /> {agent.phone}
              </a>
            </div>
          )}
          <p className="mt-6 text-xs text-muted-2">
            Ref. {listing.externalRef} · Source:{" "}
            <a href={listing.sourceUrl} className="underline underline-offset-2 hover:text-foreground" rel="noopener noreferrer nofollow" target="_blank">
              original public ad
            </a>
          </p>
        </section>

        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <ViewingForm listingId={listing.id} street={listing.street} agentName={agent?.name ?? "Our agent"} petsAllowed={listing.petsAllowed} />
          </div>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="mt-16" aria-labelledby="similar-h">
          <h2 id="similar-h" className="mb-5 text-2xl font-semibold tracking-[-0.03em]">
            Also worth a look{sameArea.length > 1 ? ` in District ${listing.district}` : ""}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l) => (
              <li key={l.id}><ListingCard listing={l} /></li>
            ))}
          </ul>
        </section>
      )}
      <p className="sr-only">Rent {formatHuf(listing.rentHuf)} per month.</p>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <p className="text-xl font-semibold tracking-[-0.02em]">{v}</p>
      <p className="text-[11px] text-muted">{k}</p>
    </div>
  );
}
