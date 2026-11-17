import Link from "next/link";
import { ArrowRight, ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
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
  const featuredCost = monthlyCost(featured);
  const readyNow = all.filter((l) => l.availableNow).length;
  const cheapest = Math.min(...all.map((l) => l.rentHuf));
  const districts = [...new Set(all.map((l) => l.district))].sort((a, b) => districtNumber(a) - districtNumber(b));
  const latest = all.filter((l) => l.id !== featured.id && l.imageUrl).slice(0, 5);
  const years = new Date().getFullYear() - agency.founded;
  const delay = (ms: number) => ({ "--enter-delay": `${ms}ms` }) as React.CSSProperties;

  return (
    <>
      {/* ── Hero: one photo-led screen ─────────────────────────── */}
      <section className="wrap pt-4" aria-labelledby="hero-h">
        <div className="tile relative flex min-h-[calc(100svh-120px)] flex-col justify-end md:min-h-[680px]">
          <ListingPhoto src={featured.imageUrl} alt={featured.title} seed={`hero-${featured.slug}`} className="absolute inset-0" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" aria-hidden />

          <div className="relative grid gap-10 p-5 pb-6 md:p-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <p className="eyebrow enter">{agency.tagline}</p>
              <h1 id="hero-h" className="display enter mt-6 text-[60px] text-white sm:text-[84px] lg:text-[112px]" style={delay(60)}>
                Budapest flats, with <em>every</em> cost on the table.
              </h1>
              <p className="enter mt-6 max-w-xl text-lg leading-relaxed text-white/75" style={delay(140)}>
                {all.length} long-term rentals from {formatHuf(cheapest)}. Rent, common charge and bills added up on every flat, one agent from first call to keys, and nothing to pay as a tenant.
              </p>
              <div className="enter mt-8 max-w-2xl" style={delay(220)}>
                <HeroSearch districts={districts} />
              </div>
            </div>

            <Link
              href={`/rentals/${featured.slug}`}
              className="enter group hidden rounded-2xl border border-white/15 bg-black/40 p-5 text-white backdrop-blur-xl transition-[border-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/60 lg:col-span-4 lg:block"
              style={delay(300)}
            >
              <p className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
                In the photo · District {featured.district}
                <ArrowUpRight className="size-4 text-white/60 transition-colors group-hover:text-accent" />
              </p>
              <p className="display mt-3 text-[30px] leading-[1.02]">{featured.title}</p>
              <dl className="num mt-5 grid grid-cols-3 gap-3 border-t border-white/15 pt-4 text-sm">
                <div><dt className="text-[11px] text-white/55">Rent</dt><dd className="font-medium">{formatHufShort(featured.rentHuf)}</dd></div>
                <div><dt className="text-[11px] text-white/55">All-in</dt><dd className="font-medium text-accent">{formatHufShort(featuredCost.total)}</dd></div>
                <div><dt className="text-[11px] text-white/55">Size</dt><dd className="font-medium">{featured.sizeM2} m²</dd></div>
              </dl>
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap">
        {/* ── Proof strip ──────────────────────────── */}
        <section className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4" aria-label="Lakáspont in numbers">
          <Stat value={String(years)} unit="years" label={`Letting downtown Budapest since ${agency.founded}`} />
          <Stat value={String(readyNow)} unit="flats" label="Ready to move into now" accent />
          <Stat value={formatHufShort(cheapest).replace(" Ft", "")} unit="Ft" label="Lowest monthly rent on the list" />
          <Stat value="0" unit="Ft" label="Agency fee for tenants. Ever." />
        </section>

        {/* ── Just listed: bento of photos ─────────── */}
        <section className="mt-28" aria-labelledby="latest-h">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow">Just listed</p>
              <h2 id="latest-h" className="display mt-4 text-5xl md:text-7xl">
                New on the <em>list</em>.
              </h2>
            </div>
            <Button asChild variant="secondary" size="lg"><Link href="/rentals">All {all.length} flats <ArrowRight /></Link></Button>
          </div>
          <ul className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-12">
            {latest.map((l, i) => (
              <li key={l.id} className={i === 0 ? "sm:col-span-2 lg:col-span-6 lg:row-span-2" : "lg:col-span-3"}>
                <Reveal delay={(i % 3) * 0.06} className="h-full">
                  <ListingCard listing={l} tall={i === 0} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* ── The promise: three numbered tiles ─────── */}
        <section className="mt-28 grid gap-4 lg:grid-cols-12" aria-labelledby="why-h">
          <div className="lg:col-span-4">
            <p className="eyebrow">Why rent with us</p>
            <h2 id="why-h" className="display mt-4 text-5xl md:text-6xl">
              The number you <em>actually</em> pay.
            </h2>
          </div>
          <ul className="grid gap-4 md:grid-cols-3 lg:col-span-8">
            {[
              { t: "One honest total", b: "Most ads bury the common charge in paragraph four. We add rent, fees and average bills into one figure on every flat." },
              { t: "One agent to the keys", b: "You deal with the person who knows the owner and the building. Not a call centre, not a portal inbox." },
              { t: "Free for tenants", b: "Viewings, contract paperwork and the handover cost tenants nothing." },
            ].map(({ t, b }, i) => (
              <li key={t}>
                <Reveal delay={i * 0.06} className="h-full">
                  <div className="tile flex h-full flex-col justify-between gap-12 p-6">
                    <span className="display text-6xl text-accent">0{i + 1}</span>
                    <div>
                      <h3 className="text-lg font-medium">{t}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{b}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Districts + owners ───────────────────── */}
        <section className="mt-28 grid gap-4 lg:grid-cols-12" aria-labelledby="areas-h">
          <Reveal className="lg:col-span-7">
            <div className="tile h-full p-6 md:p-8">
              <p className="eyebrow">Where we let</p>
              <h2 id="areas-h" className="display mb-8 mt-4 text-5xl">Pick a <em>district</em>.</h2>
              <DistrictGrid listings={all} />
              <p className="mt-4 text-xs text-muted-2">Yellow dot: a district we know street by street.</p>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-5" delay={0.06}>
            <div className="tile flex h-full min-h-[420px] flex-col justify-between gap-10 border-transparent bg-accent p-6 text-accent-ink md:p-8">
              <p className="text-[11px] font-medium uppercase tracking-[0.16em]">For owners</p>
              <div>
                <h2 className="display text-6xl md:text-7xl">What will your flat <em className="!text-accent-ink">let</em> for?</h2>
                <p className="mt-4 max-w-sm text-accent-ink/75">An estimate built from the {all.length} flats we&apos;re letting right now. Twenty seconds, no sign-up to see the number.</p>
              </div>
              <Link href="/owners" className="inline-flex h-12 w-fit items-center gap-2 rounded-full bg-accent-ink px-6 text-sm font-medium text-accent transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
                Get my rent estimate <ArrowRight className="size-4" />
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ── Contact ─────────────────────────────── */}
        <section id="contact" className="mt-28 grid scroll-mt-24 gap-4 lg:grid-cols-12" aria-labelledby="contact-h">
          <Reveal className="lg:col-span-8">
            <div className="tile h-full p-6 md:p-10">
              <p className="eyebrow">Szerb utca, District V</p>
              <h2 id="contact-h" className="display mt-4 text-5xl md:text-7xl">Talk to a person, <em>not</em> a portal.</h2>
              <p className="mt-5 max-w-lg text-muted">Tell us the district, the budget and the move-in date. We&apos;ll shortlist flats that fit and line up the viewings.</p>
              <ul className="mt-10 grid gap-5 sm:grid-cols-2">
                {agency.phones.map((p) => (
                  <li key={p}><a className="num inline-flex items-center gap-3 text-xl hover:text-accent" href={`tel:${p.replace(/\s/g, "")}`}><Phone className="size-4 text-accent" />{p}</a></li>
                ))}
                <li><a className="inline-flex items-center gap-3 hover:text-accent" href={`mailto:${agency.emails.office}`}><Mail className="size-4 text-accent" />{agency.emails.office}</a></li>
                <li className="inline-flex items-center gap-3 text-muted"><MapPin className="size-4 text-accent" />{agency.address.street}, {agency.address.postcode} {agency.address.city}</li>
              </ul>
            </div>
          </Reveal>
          {agent && (
            <Reveal className="lg:col-span-4" delay={0.06}>
              <Link href={`/team/${agent.slug}`} className="tile group flex h-full flex-col justify-between gap-10 p-6 md:p-8">
                <div className="display grid size-20 place-items-center rounded-full border border-border-strong text-4xl" aria-hidden>MS</div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{agent.role}</p>
                  <p className="display mt-2 text-5xl transition-colors group-hover:text-accent">{agent.name}</p>
                  <p className="mt-3 text-sm text-muted">Your contact for every flat on this site.</p>
                </div>
              </Link>
            </Reveal>
          )}
        </section>
      </div>
    </>
  );
}

function Stat({ value, unit, label, accent = false }: { value: string; unit: string; label: string; accent?: boolean }) {
  return (
    <div className="tile flex flex-col justify-between gap-8 p-5 md:p-6">
      <p className="flex items-baseline gap-2">
        <span className={`display num text-6xl md:text-7xl ${accent ? "text-accent" : ""}`}>{value}</span>
        <span className="text-sm text-muted">{unit}</span>
      </p>
      <p className="text-sm leading-snug text-muted">{label}</p>
    </div>
  );
}
