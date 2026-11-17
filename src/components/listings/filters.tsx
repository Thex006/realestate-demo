"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { X } from "@phosphor-icons/react/ssr";
import type { ListingFilters } from "@/lib/types";
import { filtersToSearch, kindPath } from "@/lib/listing-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

const ANY = "any";
export const BUDGETS = {
  rent: [1200, 1500, 2000, 3000, 4000],
  sale: [300_000, 500_000, 750_000, 1_000_000, 2_000_000],
} as const;
const fmtBudget = (n: number) => (n >= 1_000_000 ? `€${n / 1_000_000}M` : n >= 10_000 ? `€${n / 1000}k` : `€${n.toLocaleString("en")}`);

/** Every change rewrites the URL, so results are shareable and Back works. */
export function Filters({ value, districts, views }: { value: ListingFilters; districts: { code: string; count: number }[]; views: string[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (patch: Partial<ListingFilters>) => start(() => router.replace(`${kindPath(value.kind)}${filtersToSearch({ ...value, ...patch })}`, { scroll: false }));
  const toggles: [keyof ListingFilters, string][] = [["furnished", "Furnished"], ["pets", "Pets OK"], ["garage", "Garage"]];
  const active = [value.district, value.maxPrice, value.minBedrooms, value.type, value.view, value.furnished, value.pets, value.garage].some(Boolean);

  return (
    <div className={cn("grid gap-3 border-y border-border py-4 transition-opacity", pending && "opacity-70")} aria-busy={pending}>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Pick label="District" value={value.district} onChange={(v) => set({ district: v })} options={districts.map((d) => [d.code, `District ${d.code} (${d.count})`])} anyLabel="All districts" />
        <Pick label="Budget" value={value.maxPrice ? String(value.maxPrice) : undefined} onChange={(v) => set({ maxPrice: v ? Number(v) : undefined })} options={BUDGETS[value.kind].map((b) => [String(b), `Up to ${fmtBudget(b)}`])} anyLabel="Any budget" />
        <Pick label="Bedrooms" value={value.minBedrooms ? String(value.minBedrooms) : undefined} onChange={(v) => set({ minBedrooms: v ? Number(v) : undefined })} options={[1, 2, 3, 4, 5].map((n) => [String(n), `${n}+ bedrooms`])} anyLabel="Any bedrooms" />
        <Pick label="Type" value={value.type} onChange={(v) => set({ type: v as ListingFilters["type"] })} options={[["apartment", "Apartments"], ["house", "Houses"]]} anyLabel="Any type" />
        <Pick label="View" value={value.view} onChange={(v) => set({ view: v })} options={views.map((v) => [v, `${v} view`])} anyLabel="Any view" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {toggles.map(([k, label]) => (
          <button
            key={k}
            type="button"
            aria-pressed={!!value[k]}
            onClick={() => set({ [k]: value[k] ? undefined : true })}
            className={cn("rounded-full border px-4 py-1 caption-5 transition-colors", value[k] ? "border-accent bg-accent text-accent-ink" : "border-border-strong text-muted hover:text-foreground")}
          >
            {label}
          </button>
        ))}
        {active && (
          <button type="button" onClick={() => router.replace(kindPath(value.kind), { scroll: false })} className="ml-1 inline-flex items-center gap-1 caption-5 text-muted hover:text-foreground">
            <X className="size-3.5" /> Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function Pick({ label, value, onChange, options, anyLabel }: { label: string; value?: string; onChange: (v: string | undefined) => void; options: [string, string][]; anyLabel: string }) {
  return (
    <Select value={value ?? ANY} onValueChange={(v) => onChange(v === ANY ? undefined : v)}>
      <SelectTrigger aria-label={label} className="h-11 rounded-full"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>{anyLabel}</SelectItem>
        {options.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}

export function SortSelect({ value }: { value: ListingFilters }) {
  const router = useRouter();
  return (
    <Select value={value.sort ?? "newest"} onValueChange={(v) => router.replace(`${kindPath(value.kind)}${filtersToSearch({ ...value, sort: v as ListingFilters["sort"] })}`, { scroll: false })}>
      <SelectTrigger className="h-9 w-48 rounded-full" aria-label="Sort"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Newest first</SelectItem>
        <SelectItem value="price-asc">Price: low to high</SelectItem>
        <SelectItem value="price-desc">Price: high to low</SelectItem>
        <SelectItem value="size-desc">Largest first</SelectItem>
      </SelectContent>
    </Select>
  );
}
