import type { Metadata } from "next";
import Link from "next/link";
import { agency } from "@/data/agency";
import { allListings } from "@/lib/db";
import { SplitWords } from "@/components/fx/split-words";
import { Spotlight } from "@/components/fx/tilt";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Why redesign: notes for the agency" };

/** Unlinked page for the pitch meeting. Every finding was checked on the live site on 17 Nov 2026. */
const FINDINGS = [
  { where: "Every page footer", what: "“© BLA 2019”", why: "A copyright line seven years out of date tells a buyer spending a million euros that nobody is looking after the site." },
  { where: "All 22 sale listings", what: "“Invetsment Advisor”", why: "The typo sits right under the advisor's name, at the moment a buyer decides whether to call." },
  { where: "About page search snippet", what: "“Our Team ot Budapest Luxury Apartments”", why: "This is the text Google and WhatsApp show when someone shares the page." },
  { where: "48 pages", what: "A testimonial recommending the “Eurocenter team”", why: "Sends a reader's trust to a sister brand, on the agency's own site." },
  { where: "About page", what: "14 links that go nowhere (href=\"#\")", why: "Every dead click is a visitor who leaves instead of calling." },
];

export default async function PitchPage() {
  const all = await allListings();
  const photos = all.reduce((n, l) => n + l.photos.length, 0);
  const fixes = [
    ["Speed to a call", "Every listing has a viewing request with four required fields, an agent you can call in one tap and a sticky price card. Leads are scored hot, warm or cold before anyone picks up the phone."],
    ["Owners become leads", `A live valuation calculator built on the agency's own ${all.length} listings turns curious owners into named valuation requests.`],
    ["Shareable search", "Every filter lives in the URL, so a relocation manager can send a client the exact shortlist."],
    ["Feels like the homes", `The site leads with the agency's own ${photos} photographs: a cinematic hero, a 3D photo wall, and galleries that move as you scroll. It all stays smooth on phones and goes still for anyone who prefers reduced motion.`],
  ];
  return (
    <div className="wrap pt-24">
      <header className="mb-16 max-w-4xl">
        <p className="eyebrow enter">For {agency.name}</p>
        <h1 className="heading-1 mt-4"><SplitWords text="Your homes deserve a *better* window." /></h1>
        <p className="enter mt-8 max-w-xl text-muted" style={{ "--enter-delay": "0.6s" } as React.CSSProperties}>
          This concept was built with the agency&apos;s own public listings, photos, team and testimonials. Here is what the live site loses today, and what this version fixes.
        </p>
      </header>

      <section aria-labelledby="f-h">
        <h2 id="f-h" className="eyebrow">Found on the live site</h2>
        <ol className="mt-8 grid gap-3">
          {FINDINGS.map((f, i) => (
            <Reveal key={f.what} delay={0.05 * i}>
              <Spotlight className="tile grid gap-3 p-6 md:grid-cols-12 md:items-baseline">
                <p className="num caption-5 text-muted-2 md:col-span-2">0{i + 1} · {f.where}</p>
                <p className="heading-4 md:col-span-4">{f.what}</p>
                <p className="text-muted md:col-span-6">{f.why}</p>
              </Spotlight>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="pt-24" aria-labelledby="x-h">
        <h2 id="x-h" className="heading-2">What this version <em>fixes</em></h2>
        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {fixes.map(([t, b], i) => (
            <Reveal key={t} delay={0.06 * i}>
              <Spotlight className="tile h-full p-8">
                <h3 className="heading-3">{t}</h3>
                <p className="mt-3 text-muted">{b}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>
        <p className="mt-12"><Link href="/" className="text-accent underline-offset-4 hover:underline">Walk through the concept →</Link></p>
      </section>
    </div>
  );
}
