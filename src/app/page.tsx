import Link from "next/link";
import { ArrowRight, Calculator, Mail, MapPin, Phone, Receipt, UserRound, Wallet } from "lucide-react";
import { agency } from "@/data/agency";
import { getAgentBySlug, searchListings } from "@/lib/db";
import { districtNumber, formatHuf, formatHufShort } from "@/lib/format";
import { monthlyCost } from "@/lib/cost";
import { ListingCard } from "@/components/listings/listing-card";
import { ListingPhoto } from "@/components/listings/listing-photo";
import { HeroSearch } from "@/components/home/hero-search";
import { DistrictGrid } from "@/components/home/district-grid";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [all, agent] = await Promise.all([searchListings({}), getAgentBySlug("monika-stark")]);
  const featured = all.find((l) => l.slug === "frankel-leo-ut-129m2-ii") ?? all[0];
  const readyNow = all.filter((l) => l.availableNow).length;
  const cheapest = Math.min(...all.map((l) => l.rentHuf));
  const districts = [...new Set(all.map((l) => l.district))].sort((a, b) => districtNumber(a) - districtNumber(b));
  const latest = all.filter((l) => l.id !== featured.id).slice(0, 6);
  const years = new Date().getFullYear() - agency.founded;
  const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as React.CSSProperties;

  return (
    <div className="wrap pt-6">
      {/* ── Bento hero ─────────────────────────────── */}
      <section className="grid gap-4 lg:grid-cols-12 lg:grid-rows-[auto_auto]" aria-labelledby="hero-h">
        <div className="tile enter flex flex-col justify-between gap-10 p-6 md:p-10 lg:col-span-8 lg:row-span-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">{agency.tagline}</p>
            <h1 id="hero-h" className="mt-5 max-w-3xl text-[44px] font-semibold leading-[0.98] tracking-[-0.045em] md:text-7xl">
              Rent in central Budapest. Know the real cost before you view.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              {all.length} flats from {formatHuf(cheapest)} a month, each with rent, common charge and bills added up on the card. One agent from the first call to the keys, and it costs tenants nothing.
            </p>
          </div>
          <HeroSearch districts={districts} />
        </div>

        <Link href={`/rentals/${featured.slug}`} className="tile group enter flex min-h-[340px] flex-col justify-end lg:col-span-4" style={delay(90)}>
          <ListingPhoto src={featured.imageUrl} alt={featured.title} district={featured.district} className="absolute inset-0" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" aria-hidden />
          <div className="relative p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-accent">Featured · District {featured.district}</p>
            <p className="mt-2 text-xl font-semibold leading-tight tracking-[-0.02em]">{featured.title}</p>
            <p className="num mt-2 text-sm text-white/75">
              {formatHuf(featured.rentHuf)} · {featured.sizeM2} m² · {formatHuf(monthlyCost(featured).total)} all-in
            </p>
          </div>
        </Link>

        <div className="grid grid-cols-2 gap-4 lg:col-span-4">
          <Stat value={String(agency.founded)} label={`${years} years renting downtown`} style={delay(150)} />
          <Stat value={String(readyNow)} label="flats ready to move in now" style={delay(200)} accent />
          <Stat value={formatHufShort(cheapest)} label="lowest rent on our list" style={delay(250)} />
          <Stat value={String(districts.length)} label="districts, Pest and Buda" style={delay(300)} />
        </div>
      </section>

      {/* ── Why us: three tiles ─────────────────────── */}
      <section className="mt-4 grid gap-4 md:grid-cols-3" aria-label="Why rent with Lakáspont">
        {[
          { icon: Receipt, t: "The real monthly cost, up front", b: "Most ads bury the common charge in paragraph four. We add rent, fees and average bills into one number on every flat." },
          { icon: UserRound, t: "One agent, start to keys", b: "You deal with the person who knows the owner and the building, not a call centre or a portal inbox." },
          { icon: Wallet, t: "Free for tenants", b: "Viewings, contract paperwork and the handover cost tenants nothing. Ever." },
        ].map(({ icon: Icon, t, b }, i) => (
          <Reveal key={t} delay={i * 0.06}>
            <div className="tile h-full p-6">
              <Icon className="size-5 text-accent" />
              <h2 className="mt-8 text-lg font-medium tracking-[-0.01em]">{t}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b}</p>
            </div>
          </Reveal>
        ))}
      </section>

      {/* ── Listings ─────────────────────────────── */}
      <section className="mt-20" aria-labelledby="latest-h">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 id="latest-h" className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">Just listed</h2>
          <Button asChild variant="secondary"><Link href="/rentals">All {all.length} flats <ArrowRight /></Link></Button>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((l, i) => (
            <li key={l.id}><Reveal delay={(i % 3) * 0.06} className="h-full"><ListingCard listing={l} /></Reveal></li>
          ))}
        </ul>
      </section>

      {/* ── Districts + owners bento ──────────────── */}
      <section className="mt-20 grid gap-4 lg:grid-cols-12" aria-labelledby="areas-h">
        <Reveal className="lg:col-span-7">
          <div className="tile h-full p-6">
            <h2 id="areas-h" className="text-2xl font-semibold tracking-[-0.03em]">Pick a district</h2>
            <p className="mb-6 mt-1 text-sm text-muted">Yellow dot: the districts we know street by street.</p>
            <DistrictGrid listings={all} />
          </div>
        </Reveal>
        <Reveal className="lg:col-span-5" delay={0.06}>
          <div className="tile flex h-full flex-col justify-between gap-10 bg-accent p-6 text-accent-ink md:p-8">
            <Calculator className="size-6" />
            <div>
              <h2 className="text-3xl font-semibold leading-tight tracking-[-0.035em]">Own a flat? See what it lets for.</h2>
              <p className="mt-3 text-accent-ink/80">A rent estimate built from the {all.length} flats we&apos;re letting right now. Twenty seconds, no sign-up to see the number.</p>
            </div>
            <Link href="/owners" className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-accent-ink px-6 text-sm font-medium text-accent transition-transform active:scale-[0.98]">
              Get my rent estimate <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </section>

      {/* ── Contact ─────────────────────────────── */}
      <section id="contact" className="mt-20 grid scroll-mt-24 gap-4 lg:grid-cols-12" aria-labelledby="contact-h">
        <Reveal className="lg:col-span-7">
          <div className="tile h-full p-6 md:p-8">
            <h2 id="contact-h" className="text-3xl font-semibold tracking-[-0.035em]">Talk to a person, not a portal.</h2>
            <p className="mt-3 max-w-lg text-muted">
              Call or drop by the office on Szerb utca. Tell us the district, the budget and the move-in date, and we&apos;ll shortlist flats that fit.
            </p>
            <ul className="mt-8 grid gap-4 text-sm sm:grid-cols-2">
              {agency.phones.map((p) => (
                <li key={p}><a className="num inline-flex items-center gap-2 text-lg hover:text-accent" href={`tel:${p.replace(/\s/g, "")}`}><Phone className="size-4 text-accent" />{p}</a></li>
              ))}
              <li><a className="inline-flex items-center gap-2 hover:text-accent" href={`mailto:${agency.emails.office}`}><Mail className="size-4 text-accent" />{agency.emails.office}</a></li>
              <li className="inline-flex items-center gap-2 text-muted"><MapPin className="size-4 text-accent" />{agency.address.street}, {agency.address.postcode} {agency.address.city}</li>
            </ul>
          </div>
        </Reveal>
        {agent && (
          <Reveal className="lg:col-span-5" delay={0.06}>
            <Link href={`/team/${agent.slug}`} className="tile group flex h-full flex-col justify-between gap-8 p-6 md:p-8">
              <div className="grid size-16 place-items-center rounded-xl border border-border-strong bg-card-2 text-xl font-semibold" aria-hidden>MS</div>
              <div>
                <p className="text-xs uppercase tracking-[0.12em] text-muted">{agent.role}</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] group-hover:text-accent">{agent.name}</p>
                <p className="mt-2 text-sm text-muted">Your contact for every flat on this site.</p>
              </div>
            </Link>
          </Reveal>
        )}
      </section>
    </div>
  );
}

function Stat({ value, label, accent = false, style }: { value: string; label: string; accent?: boolean; style?: React.CSSProperties }) {
  return (
    <div className="tile enter flex flex-col justify-between gap-6 p-4" style={style}>
      <span className={`num text-3xl font-semibold tracking-[-0.04em] ${accent ? "text-accent" : ""}`}>{value}</span>
      <span className="text-xs leading-snug text-muted">{label}</span>
    </div>
  );
}
