import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, Phone } from "@phosphor-icons/react/ssr";
import { allListings, getAgents, getListing } from "@/lib/db";
import { bedsLabel, formatEur, headline } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { Gallery } from "@/components/listings/gallery";
import { ListingCard } from "@/components/listings/listing-card";
import { Photo } from "@/components/listings/photo";
import { ViewingForm } from "@/components/forms/viewing-form";
import { SplitWords } from "@/components/fx/split-words";
import { Tilt } from "@/components/fx/tilt";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const l = await getListing((await params).slug);
  return l ? { title: `${l.street}, District ${l.district}`, description: headline(l) } : { title: "Home not found" };
}

const FURNISHED = { yes: "Furnished", no: "Unfurnished", optional: "Furnished or unfurnished", partly: "Part furnished" } as const;

function features(l: Listing): string[] {
  const f: [boolean | null, string][] = [
    [l.elevator, "Lift"], [l.airConditioning, "Air conditioning"], [l.garage, "Garage"], [l.alarm, "Alarm"],
    [l.sauna, "Sauna"], [l.pool, "Pool"], [l.petFriendly, "Pets welcome"],
  ];
  return [...(l.furnished ? [FURNISHED[l.furnished]] : []), ...f.filter(([v]) => v).map(([, s]) => s)];
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
  const listing = await getListing((await params).slug);
  if (!listing) notFound();
  const [all, agents] = await Promise.all([allListings(), getAgents()]);
  const agent = agents.find((a) => a.slug === listing.agent) ?? agents[0];
  const similar = all
    .filter((l) => l.kind === listing.kind && l.id !== listing.id)
    .sort((a, b) => Number(b.district === listing.district) - Number(a.district === listing.district) || Math.abs(a.priceEur - listing.priceEur) - Math.abs(b.priceEur - listing.priceEur))
    .slice(0, 3);
  const rent = listing.kind === "rent";
  const back = rent ? "/rent" : "/buy";
  const paras = listing.description.split(/\n+/).map((p) => p.trim()).filter(Boolean);
  const facts: [string, string][] = [
    ["Size", `${listing.sizeM2} m²`],
    ["Bedrooms", bedsLabel(listing.bedrooms)],
    ["Bathrooms", String(listing.bathrooms)],
    ["View", listing.view ?? "Not stated"],
    ["District", `${listing.district}, ${listing.neighbourhood}`],
    ["Reference", listing.ref],
  ];

  return (
    <div className="wrap pt-24">
      <Link href={back} className="mb-6 inline-flex items-center gap-2 caption-5 text-muted transition-colors hover:text-foreground">
        <ArrowLeft className="size-4" /> {rent ? "All homes to rent" : "All homes for sale"}
      </Link>

      <Gallery photos={listing.photos} title={listing.street} />

      <div className="mt-12 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow">District {listing.district} · {listing.neighbourhood}</p>
          <h1 className="heading-1 mt-4"><SplitWords text={listing.street} /></h1>
          <p className="mt-4 title-2 text-muted">{headline(listing)}</p>

          <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className="flex flex-col-reverse justify-end bg-background p-4">
                <dt className="mt-1 caption-5 uppercase tracking-[0.14em] text-muted-2">{k}</dt>
                <dd className="num title-2">{v}</dd>
              </div>
            ))}
          </dl>

          {features(listing).length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2" aria-label="Features">
              {features(listing).map((f) => (
                <li key={f} className="inline-flex items-center gap-2 rounded-full border border-border-strong px-4 py-2 caption-5"><Check className="size-3.5 text-accent" /> {f}</li>
              ))}
            </ul>
          )}

          <div className="mt-12 space-y-4 body-3 text-foreground/85">
            <h2 className="heading-3 text-foreground">About this home</h2>
            {paras.map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <a href={listing.sourceUrl} target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-1 caption-5 text-muted-2 hover:text-accent">
            Listing as published by the agency <ArrowUpRight className="size-3.5" />
          </a>
        </div>

        <aside className="lg:col-span-5">
          <div className="grid gap-3 lg:sticky lg:top-24">
            <div className="tile p-6">
              <p className="eyebrow">{rent ? "Monthly rent" : "Asking price"}</p>
              <p className="heading-1 num mt-4">{formatEur(listing.priceEur)}{rent && <span className="font-sans body-3 text-muted"> / month</span>}</p>
              <div className="mt-6 flex items-center gap-4 border-t border-border pt-6">
                <div className="relative size-16 shrink-0 overflow-hidden rounded-full bg-card-2"><Photo src={agent.photoUrl} alt="" /></div>
                <div className="min-w-0">
                  <p className="heading-5">{agent.name}</p>
                  <p className="caption-5 text-muted">{agent.role}</p>
                </div>
                <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="ml-auto grid size-11 shrink-0 place-items-center rounded-full border border-border-strong transition-colors hover:border-accent hover:text-accent" aria-label={`Call ${agent.name}`}><Phone className="size-4" /></a>
              </div>
            </div>
            <ViewingForm listingId={listing.id} kind={listing.kind} street={listing.street} agentName={agent.name.split(" ")[0]} />
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="pt-24" aria-labelledby="sim-h">
          <p className="eyebrow">Also {rent ? "to rent" : "for sale"}</p>
          <h2 id="sim-h" className="heading-2 mb-12 mt-4">You might <em>also</em> love</h2>
          <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l, i) => <li key={l.id}><Reveal delay={i * 0.06}><Tilt><ListingCard listing={l} /></Tilt></Reveal></li>)}
          </ul>
        </section>
      )}
    </div>
  );
}
