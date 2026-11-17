import type { Kind, ListingFilters } from "./types";

const SORTS = ["newest", "price-asc", "price-desc", "size-desc"] as const;
const int = (v?: string) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
};
export const VIEWS = ["Panoramic", "River Danube", "Buda Hills", "Garden", "Street", "Courtyard", "Square"] as const;

/** URL search params -> validated filters. Unknown values are dropped, never trusted. */
export function parseFilters(kind: Kind, sp: Record<string, string | string[] | undefined>): ListingFilters {
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;
  const district = get("district");
  const type = get("type");
  const view = get("view");
  const sort = get("sort") as ListingFilters["sort"];
  return {
    kind,
    district: district && /^[IVX]{1,5}$/.test(district) ? district : undefined,
    maxPrice: int(get("maxPrice")),
    minBedrooms: int(get("beds")),
    type: type === "apartment" || type === "house" ? type : undefined,
    view: view && (VIEWS as readonly string[]).includes(view) ? view : undefined,
    furnished: get("furnished") === "1" || undefined,
    pets: get("pets") === "1" || undefined,
    garage: get("garage") === "1" || undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
  };
}

/** Filters -> parameterised SQL. Only literals from this file reach the SQL string. */
export function buildListingQuery(f: ListingFilters): { sql: string; params: unknown[] } {
  const params: unknown[] = [f.kind];
  const where = ["l.kind = $1", "l.status = 'active'"];
  const add = (clause: string, v: unknown) => {
    params.push(v);
    where.push(clause.replace("?", `$${params.length}`));
  };
  if (f.district) add("l.district = ?", f.district);
  if (f.maxPrice) add("l.price_eur <= ?", f.maxPrice);
  if (f.minBedrooms) add("l.bedrooms >= ?", f.minBedrooms);
  if (f.type) add("l.type = ?", f.type);
  if (f.view) add("l.view = ?", f.view);
  if (f.furnished) where.push("l.furnished in ('yes','optional','partly')");
  if (f.pets) where.push("l.pet_friendly is true");
  if (f.garage) where.push("l.garage is true");
  const order = { newest: "l.position asc", "price-asc": "l.price_eur asc", "price-desc": "l.price_eur desc", "size-desc": "l.size_m2 desc" }[f.sort ?? "newest"];
  return { sql: `select l.* from listings l where ${where.join(" and ")} order by ${order}, l.id`, params };
}

export function filtersToSearch(f: Partial<ListingFilters>): string {
  const p = new URLSearchParams();
  if (f.district) p.set("district", f.district);
  if (f.maxPrice) p.set("maxPrice", String(f.maxPrice));
  if (f.minBedrooms) p.set("beds", String(f.minBedrooms));
  if (f.type) p.set("type", f.type);
  if (f.view) p.set("view", f.view);
  if (f.furnished) p.set("furnished", "1");
  if (f.pets) p.set("pets", "1");
  if (f.garage) p.set("garage", "1");
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export const kindPath = (k: Kind) => (k === "rent" ? "/rent" : "/buy");
