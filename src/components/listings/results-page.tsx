import Link from "next/link";
import type { Kind } from "@/lib/types";
import { allListings, searchListings } from "@/lib/db";
import { parseFilters, VIEWS } from "@/lib/listing-query";
import { districtNumber } from "@/lib/format";
import { Filters, SortSelect } from "./filters";
import { ListingCard } from "./listing-card";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SplitWords } from "@/components/fx/split-words";
import { Tilt } from "@/components/fx/tilt";

const COPY = {
  rent: { eyebrow: "To rent", h1: "Homes to rent, *ready* for you.", sub: "Furnished apartments, penthouses and family houses for long lets. Viewings are free, and one agent handles everything from the first visit to the handover." },
  sale: { eyebrow: "For sale", h1: "Own a piece of *Budapest*.", sub: "Apartments, penthouses and villas for buyers and investors, some with sitting tenants. Ask our investment advisor for comparables before you offer." },
} as const;

export async function ResultsPage({ kind, searchParams }: { kind: Kind; searchParams: Record<string, string | string[] | undefined> }) {
  const filters = parseFilters(kind, searchParams);
  const [results, all] = await Promise.all([searchListings(filters), allListings()]);
  const pool = all.filter((l) => l.kind === kind);
  const counts = pool.reduce<Record<string, number>>((a, l) => ((a[l.district] = (a[l.district] ?? 0) + 1), a), {});
  const districts = Object.entries(counts).map(([code, count]) => ({ code, count })).sort((a, b) => districtNumber(a.code) - districtNumber(b.code));
  const views = VIEWS.filter((v) => pool.some((l) => l.view === v));
  const c = COPY[kind];

  return (
    <div className="wrap pt-24">
      <header className="enter mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="eyebrow">{c.eyebrow}</p>
          <h1 className="heading-1 mt-4"><SplitWords text={c.h1} /></h1>
        </div>
        <p className="text-muted lg:col-span-4">{c.sub}</p>
      </header>

      <Filters value={filters} districts={districts} views={views} />

      <div className="mb-8 mt-6 flex items-center justify-between gap-4">
        <p className="num body-6 text-muted" data-testid="result-count" aria-live="polite">
          {results.length} {results.length === 1 ? "home" : "homes"}{results.length !== pool.length && ` of ${pool.length}`}
        </p>
        <SortSelect value={filters} />
      </div>

      {results.length ? (
        <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l, i) => <li key={l.id}><Reveal delay={(i % 3) * 0.06}><Tilt><ListingCard listing={l} priority={i < 3} /></Tilt></Reveal></li>)}
        </ul>
      ) : (
        <div className="tile grid place-items-center gap-4 px-6 py-20 text-center">
          <p className="heading-3">Nothing on the list matches, yet.</p>
          <p className="max-w-md text-muted">The full portfolio is larger than what&apos;s online. Tell us the brief and we&apos;ll send what fits.</p>
          <div className="flex gap-3">
            <Button asChild variant="secondary"><Link href={kind === "rent" ? "/rent" : "/buy"}>Clear filters</Link></Button>
            <Button asChild><a href="tel:+36209190005">Call the team</a></Button>
          </div>
        </div>
      )}
    </div>
  );
}
