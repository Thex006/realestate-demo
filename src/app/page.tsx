import Link from "next/link";
import { ArrowUpRight, Phone } from "@phosphor-icons/react/ssr";
import { agency, testimonials } from "@/data/agency";
import { allListings, getAgents } from "@/lib/db";
import { formatEur, formatEurShort } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { Hero } from "@/components/home/hero";
import { PhotoWall } from "@/components/home/photo-wall";
import { Rail } from "@/components/home/rail";
import { ServicesStory } from "@/components/home/services-story";
import { ListingCard } from "@/components/listings/listing-card";
import { Photo } from "@/components/listings/photo";
import { CountUp } from "@/components/fx/count-up";
import { Marquee } from "@/components/fx/marquee";
import { TaglineReveal } from "@/components/fx/tagline-reveal";
import { Parallax } from "@/components/fx/parallax";
import { Spotlight, Tilt } from "@/components/fx/tilt";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const HERO_SLUG = "turul-villa-927331";
const OWNER_SLUG = "kiraly-utca-730629"; // bright attic living room

export default async function Home() {
  const [all, agents] = await Promise.all([allListings(), getAgents()]);
  const rent = all.filter((l) => l.kind === "rent");
  const sale = all.filter((l) => l.kind === "sale");
  const hero = all.find((l) => l.slug === HERO_SLUG) ?? sale[0];
  const districts = new Set(all.map((l) => l.district)).size;
  const neighbourhoods = [...new Set(all.map((l) => l.neighbourhood))];

  // Each tile counts exactly what its link shows.
  const collection = (title: string, sub: string, kind: "rent" | "sale", test: (l: Listing) => boolean, query: string, span: string) => {
    const list = all.filter((l) => l.kind === kind && test(l));
    return { title, sub, list, href: `${kind === "rent" ? "/rent" : "/buy"}?${query}`, span };
  };
  const collections = [
    collection("Panoramic views", "Penthouses and terraces above the rooftops, to buy", "sale", (l) => l.view === "Panoramic", "view=Panoramic", "md:col-span-4 md:row-span-2"),
    collection("Houses & villas", "Room for a family and a garden, to rent", "rent", (l) => l.type === "house", "type=house", "md:col-span-2"),
    collection("Terézváros", "District VI, Andrássy út and the Opera, to rent", "rent", (l) => l.district === "VI", "district=VI", "md:col-span-2"),
    collection("Lipótváros & Belváros", "District V, steps from the Danube, to buy", "sale", (l) => l.district === "V", "district=V", "md:col-span-3"),
    collection("Hegyvidék", "District XII, green Buda hills, to rent", "rent", (l) => l.district === "XII", "district=XII", "md:col-span-3"),
  ];

  const wall = all.filter((l) => l.slug !== hero.slug).slice(0, 25).map((l) => ({ src: l.photos[1] ?? l.photos[0], href: `/property/${l.slug}`, label: l.street }));
  const featuredRent = rent.slice(0, 5);
  const featuredSale = [...sale].sort((a, b) => b.priceEur - a.priceEur).filter((l) => l.slug !== hero.slug).slice(0, 8);
  const saleFrom = Math.min(...sale.map((l) => l.priceEur));
  const rentFrom = Math.min(...rent.map((l) => l.priceEur));

  return (
    <>
      <Hero photo={hero.photos[0]} caption={{ street: hero.street, href: `/property/${hero.slug}` }} rentCount={rent.length} saleCount={sale.length} />

      {/* Proof bar: only numbers the agency publishes or that come from the live list. */}
      <section className="border-y border-border" aria-label="At a glance">
        <dl className="wrap grid grid-cols-2 divide-border md:grid-cols-4 md:divide-x">
          <Stat value={<CountUp value={agency.experienceYears} suffix="+" />} label="Years in Budapest property" />
          <Stat value={<CountUp value={all.length} />} label="Homes online right now" />
          <Stat value={<CountUp value={districts} />} label="Districts, Pest and Buda" />
          <Stat value={<span className="num">€0</span>} label="Viewing fee for tenants" />
        </dl>
      </section>

      <Marquee items={neighbourhoods} className="heading-4 border-b border-border py-6 text-muted" />

      {/* Rentals: one hero card and a stack, tilting toward the cursor. */}
      <section className="wrap pt-24" aria-labelledby="rent-h">
        <SectionHead eyebrow="To rent" id="rent-h" title={<>Move in to <em>something</em> better.</>} href="/rent" cta={`All ${rent.length} rentals from ${formatEur(rentFrom)}`} />
        <div className="grid gap-x-6 gap-y-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7 lg:row-span-2"><Tilt max={4} className="h-full"><ListingCard listing={featuredRent[0]} size="lg" priority /></Tilt></Reveal>
          {featuredRent.slice(1, 3).map((l, i) => (
            <Reveal key={l.id} delay={0.08 * (i + 1)} className="lg:col-span-5"><Tilt><ListingCard listing={l} /></Tilt></Reveal>
          ))}
        </div>
      </section>

      {/* Tagline reveal (landing-page-design B11): the core promise, word by word. */}
      <section className="wrap pt-24" aria-label="Our promise">
        <TaglineReveal
          className="heading-4 max-w-[680px] text-balance md:heading-2"
          text="Tell us how you want to live in Budapest. One agent finds the home, shows it to you for free, and stays with you after the keys."
        />
      </section>

      {/* 3D photo wall. */}
      <div className="mt-24">
        <PhotoWall tiles={wall}>
          <div className="max-w-3xl">
            <p className="eyebrow justify-center">The portfolio</p>
            <h2 className="heading-2 mt-6">{all.length} homes. <em>One</em> agent for all of them.</h2>
            <p className="mx-auto mt-6 max-w-lg text-muted">Skip booking five agencies for five viewings. Every home here is shown by the same team, and viewings cost tenants nothing.</p>
            <div className="pointer-events-auto mt-10 flex justify-center gap-3">
              <Button asChild size="lg"><Link href="/rent">Browse rentals</Link></Button>
              <Button asChild size="lg" variant="secondary"><Link href="/buy">Browse sales</Link></Button>
            </div>
          </div>
        </PhotoWall>
      </div>

      {/* Collections bento. */}
      <section className="wrap pt-12" aria-labelledby="col-h">
        <SectionHead eyebrow="Collections" id="col-h" title={<>Start with the <em>feeling</em>, not the filter.</>} />
        <div className="grid auto-rows-[260px] gap-3 md:grid-cols-6 md:auto-rows-[300px]">
          {collections.map((c, i) => (
            <Reveal key={c.title} delay={0.05 * i} className={c.span}>
              <Spotlight className="group relative block h-full overflow-hidden rounded-md bg-card-2">
                <Link href={c.href} className="block h-full">
                  <Parallax amount={6} className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]">
                      <Photo src={pickPhoto(c.list, i)} alt="" />
                    </div>
                  </Parallax>
                  <div className="absolute inset-0 bg-black/40" aria-hidden />
                  <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-white">
                    <div>
                      <h3 className="heading-4">{c.title}</h3>
                      <p className="mt-1 caption-5 text-white/70">{c.sub}</p>
                    </div>
                    <span className="num grid size-12 shrink-0 place-items-center rounded-full bg-white/10 body-6 backdrop-blur-md transition-colors group-hover:bg-accent group-hover:text-accent-ink">{c.list.length}</span>
                  </div>
                </Link>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Sales: pinned horizontal glide. */}
      <div className="mt-24">
        <Rail header={<SectionHead eyebrow="For sale" id="sale-h" title={<>Own a piece of <em>Budapest</em>.</>} href="/buy" cta={`All ${sale.length} homes from ${formatEurShort(saleFrom)}`} flush />}>
          {featuredSale.map((l) => (
            <div key={l.id} className="w-[78vw] shrink-0 snap-start sm:w-[46vw] lg:w-[30vw] lg:max-w-[440px]"><Tilt><ListingCard listing={l} /></Tilt></div>
          ))}
          <Link href="/buy" className="group grid w-[60vw] shrink-0 place-items-center rounded-md border border-border-strong text-center sm:w-[30vw] lg:w-[22vw]">
            <span>
              <span className="heading-2 block">See all <em>{sale.length}</em></span>
              <span className="mt-3 inline-flex items-center gap-1 body-6 text-muted group-hover:text-accent">Homes for sale <ArrowUpRight className="size-4" /></span>
            </span>
          </Link>
        </Rail>
      </div>

      {/* Tenant services as a scroll story. */}
      <section className="pt-24" aria-label="For tenants">
        <ServicesStory eyebrow="For tenants" title={<>Free to you. <em>Handled</em> for you.</>} items={agency.tenantServices} />
      </section>

      {/* Owners split tile. */}
      <section className="wrap pt-24" aria-labelledby="own-h">
        <Spotlight className="tile grid overflow-hidden lg:grid-cols-2">
          <div className="relative min-h-[360px] overflow-hidden">
            <Parallax amount={10} className="absolute inset-0 overflow-hidden"><Photo src={(all.find((l) => l.slug === OWNER_SLUG) ?? hero).photos[1]} alt="" /></Parallax>
          </div>
          <div className="relative p-8 md:p-12">
            <p className="eyebrow">For owners</p>
            <h2 id="own-h" className="heading-2 mt-6">What is your home <em>worth</em> today?</h2>
            <p className="mt-4 max-w-md text-muted">Get a live estimate in seconds, calculated from the {all.length} homes this agency is marketing now. Then ask for a free valuation from someone who has walked through them.</p>
            <ul className="mt-8 grid gap-3 body-6 sm:grid-cols-2">
              {agency.ownerServices.map((s) => (
                <li key={s.title} className="border-t border-border pt-3"><span className="text-foreground">{s.title}</span><span className="mt-1 block caption-5 text-muted-2">{s.body.split(",")[0]}.</span></li>
              ))}
            </ul>
            <Button asChild size="lg" className="mt-10"><Link href="/owners">Estimate my home <ArrowUpRight /></Link></Button>
          </div>
        </Spotlight>
      </section>

      {/* Real testimonials, word for word. */}
      <section className="wrap pt-24" aria-labelledby="t-h">
        <p className="eyebrow">In their words</p>
        <h2 id="t-h" className="sr-only">Testimonials</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={0.1 * i}>
              <figure className="flex h-full flex-col justify-between gap-8 border-t border-border-strong pt-8">
                <blockquote className="title-1">“{t.quote}”</blockquote>
                <figcaption className="caption-5 uppercase tracking-[0.18em] text-muted">{t.name}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 caption-5 text-muted-2">Quoted as published on the agency&apos;s own website.</p>
      </section>

      {/* Team. */}
      <section className="wrap pt-24" aria-labelledby="team-h">
        <SectionHead eyebrow="The team" id="team-h" title={<>People, not a <em>portal</em>.</>} href="/team" cta="Meet the team" />
        <div className="grid gap-6 sm:grid-cols-3">
          {agents.map((a, i) => (
            <Reveal key={a.id} delay={0.08 * i}>
              <Tilt max={5}>
                <div className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-card-2">
                    <Photo src={a.photoUrl} alt={a.name} className="grayscale transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
                  </div>
                  <p className="heading-4 mt-4">{a.name}</p>
                  <p className="mt-1 caption-5 text-muted">{a.role}</p>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing call. */}
      <section className="relative mt-24 overflow-hidden border-y border-border" aria-labelledby="cta-h">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
          <span className="beam left-[20%] opacity-50" />
          <span className="beam left-[60%] w-[12%] opacity-40" style={{ "--beam-rot": "24deg", "--beam-dur": "12s" } as React.CSSProperties} />
        </div>
        <div className="wrap relative grid gap-10 py-24 md:py-24 lg:grid-cols-12 lg:items-end">
          <h2 id="cta-h" className="heading-1 lg:col-span-8">Tell us the brief. <em>We’ll</em> find it.</h2>
          <div className="space-y-4 lg:col-span-4">
            <p className="text-muted">More homes are on the agency&apos;s books than online. One call and the team will shortlist what fits, viewings included.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg"><a href={`tel:${agency.phones.mobile.replace(/\s/g, "")}`}><Phone /> {agency.phones.mobile}</a></Button>
              <Button asChild size="lg" variant="secondary"><Link href="/rent">Start browsing</Link></Button>
            </div>
            <p className="caption-5 text-muted-2">{agency.address.street}, {agency.address.postcode} {agency.address.city}</p>
          </div>
        </div>
      </section>
    </>
  );
}

function pickPhoto(list: Listing[], i: number) {
  const l = list[i % Math.max(1, list.length)] ?? list[0];
  return l?.photos[0] ?? "";
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col-reverse px-2 py-10 md:px-8">
      <dt className="mt-2 caption-5 text-muted">{label}</dt>
      <dd className="heading-1">{value}</dd>
    </div>
  );
}

function SectionHead({ eyebrow, title, id, href, cta, flush }: { eyebrow: string; title: React.ReactNode; id: string; href?: string; cta?: string; flush?: boolean }) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${flush ? "" : "mb-12"}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="heading-2 mt-4">{title}</h2>
      </div>
      {href && cta && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-2 body-6 text-muted transition-colors hover:text-accent">
          {cta} <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
