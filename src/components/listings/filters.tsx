"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import type { ListingFilters } from "@/lib/types";
import { filtersToSearch } from "@/lib/listing-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const ANY = "any";
const budgets = [200_000, 250_000, 300_000, 400_000, 500_000, 1_000_000];
const sizes = [30, 45, 60, 80, 120];

/** Every change rewrites the URL, so results are shareable and the back button works. */
export function Filters({ value, districts, count }: { value: ListingFilters; districts: { code: string; count: number }[]; count: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const set = (patch: Partial<ListingFilters>) => {
    const next = { ...value, ...patch };
    start(() => router.replace(`/rentals${filtersToSearch(next)}`, { scroll: false }));
  };
  const active = Object.entries(value).filter(([k, v]) => v !== undefined && k !== "sort").length;

  return (
    <div className={cn("tile grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-[repeat(5,minmax(0,1fr))_auto]", pending && "opacity-80")} aria-busy={pending}>
      <Field label="District" id="f-district">
        <Select value={value.district ?? ANY} onValueChange={(v) => set({ district: v === ANY ? undefined : v })}>
          <SelectTrigger id="f-district"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>All districts</SelectItem>
            {districts.map((d) => (
              <SelectItem key={d.code} value={d.code}>District {d.code} ({d.count})</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Max rent" id="f-rent">
        <Select value={value.maxRent ? String(value.maxRent) : ANY} onValueChange={(v) => set({ maxRent: v === ANY ? undefined : Number(v) })}>
          <SelectTrigger id="f-rent"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any budget</SelectItem>
            {budgets.map((b) => (
              <SelectItem key={b} value={String(b)}>Up to {b >= 1_000_000 ? "1M" : `${b / 1000}k`} Ft</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Rooms" id="f-rooms">
        <Select value={value.minRooms ? String(value.minRooms) : ANY} onValueChange={(v) => set({ minRooms: v === ANY ? undefined : Number(v) })}>
          <SelectTrigger id="f-rooms"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any</SelectItem>
            {[1, 2, 3, 4].map((r) => (
              <SelectItem key={r} value={String(r)}>{r}+ rooms</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Size" id="f-size">
        <Select value={value.minSize ? String(value.minSize) : ANY} onValueChange={(v) => set({ minSize: v === ANY ? undefined : Number(v) })}>
          <SelectTrigger id="f-size"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any size</SelectItem>
            {sizes.map((s) => (
              <SelectItem key={s} value={String(s)}>{s}+ m²</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field label="Furnishing" id="f-furn">
        <Select value={value.furnished ?? ANY} onValueChange={(v) => set({ furnished: v === ANY ? undefined : (v as ListingFilters["furnished"]) })}>
          <SelectTrigger id="f-furn"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any</SelectItem>
            <SelectItem value="furnished">Furnished</SelectItem>
            <SelectItem value="partly">Part furnished</SelectItem>
            <SelectItem value="unfurnished">Unfurnished</SelectItem>
          </SelectContent>
        </Select>
      </Field>
      <div className="flex items-end justify-between gap-4 sm:col-span-2 lg:col-span-1">
        <label className="flex h-11 items-center gap-3 text-sm text-muted" htmlFor="f-pets">
          <Switch id="f-pets" checked={!!value.pets} onCheckedChange={(c) => set({ pets: c || undefined })} />
          Pets
        </label>
        {active > 0 && (
          <button type="button" onClick={() => set({ district: undefined, maxRent: undefined, minRooms: undefined, minSize: undefined, furnished: undefined, pets: undefined })} className="flex h-11 items-center gap-1 text-sm text-muted hover:text-foreground">
            <X className="size-4" /> Clear
          </button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">{count} flats match</p>
    </div>
  );
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
