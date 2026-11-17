import type { Metadata } from "next";
import { agency } from "@/data/agency";
import { allListings } from "@/lib/db";
import { ValuationForm } from "@/components/forms/valuation-form";
import { SplitWords } from "@/components/fx/split-words";
import { Spotlight } from "@/components/fx/tilt";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "For owners: free valuation, letting and sales" };

export default async function OwnersPage() {
  const all = await allListings();
  const comps = all.map(({ kind, district, sizeM2, priceEur, view }) => ({ kind, district, sizeM2, priceEur, view }));
  return (
    <div className="wrap pt-24">
      <header className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="eyebrow enter">For owners</p>
          <h1 className="heading-1 mt-4"><SplitWords text="What is your home *worth* today?" /></h1>
        </div>
        <p className="enter text-muted lg:col-span-4" style={{ "--enter-delay": "0.6s" } as React.CSSProperties}>
          Move the sliders for a live figure, calculated from the {all.length} homes the agency is marketing right now. Then ask for the real number, free and without obligation.
        </p>
      </header>

      <ValuationForm comps={comps} />

      <section className="pt-24" aria-labelledby="svc-h">
        <p className="eyebrow">What the agency does for owners</p>
        <h2 id="svc-h" className="heading-2 mt-4">From the first photo to the <em>fiftieth</em> month.</h2>
        <div className="mt-12 grid gap-3 md:grid-cols-2">
          {agency.ownerServices.map((s, i) => (
            <Reveal key={s.title} delay={0.06 * i}>
              <Spotlight className="tile h-full p-8">
                <p className="heading-1 num text-accent/70">0{i + 1}</p>
                <h3 className="heading-3 mt-6">{s.title}</h3>
                <p className="mt-3 max-w-md text-muted">{s.body}</p>
              </Spotlight>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
