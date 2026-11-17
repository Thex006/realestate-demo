import type { Metadata } from "next";
import Link from "next/link";
import { searchListings } from "@/lib/db";
import { parseFilters } from "@/lib/listing-query";
import { districtNumber } from "@/lib/format";
import { Filters } from "@/components/listings/filters";
import { SortSelect } from "@/components/listings/sort-select";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Flats for rent in Budapest" };

export default async function RentalsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseFilters(await searchParams);
  const [results, all] = await Promise.all([searchListings(filters), searchListings({})]);
  const districts = Object.entries(
    all.reduce<Record<string, number>>((acc, l) => ((acc[l.district] = (acc[l.district] ?? 0) + 1), acc), {}),
  )
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => districtNumber(a.code) - districtNumber(b.code));

  return (
    <div className="wrap pt-10">
      <header className="enter mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Long-term rentals</p>
          <h1 className="display mt-4 text-6xl md:text-8xl">
            {all.length} flats. <em>Every</em> cost on the card.
          </h1>
        </div>
        <p className="max-w-sm text-sm text-muted">Rent plus common charge plus average bills, added up for you. No surprises at the viewing, none at signing.</p>
      </header>

      <Filters value={filters} districts={districts} count={results.length} />

      <div className="mb-4 mt-8 flex items-center justify-between gap-4">
        <p className="num text-sm text-muted" data-testid="result-count">
          {results.length} {results.length === 1 ? "flat" : "flats"}
          {results.length !== all.length && ` of ${all.length}`}
        </p>
        <SortSelect value={filters} />
      </div>

      {results.length ? (
        <ul className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((l, i) => (
            <li key={l.id}>
              <ListingCard listing={l} priority={i < 3} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="tile grid place-items-center gap-4 p-14 text-center">
          <p className="text-lg font-medium">Nothing matches that exact brief today.</p>
          <p className="max-w-md text-sm text-muted">Tell us what you need and Monika will call you when a matching flat comes in.</p>
          <div className="flex gap-3">
            <Button asChild variant="secondary"><Link href="/rentals">Clear filters</Link></Button>
            <Button asChild><Link href="/#contact">Tell us your brief</Link></Button>
          </div>
        </div>
      )}
    </div>
  );
}
