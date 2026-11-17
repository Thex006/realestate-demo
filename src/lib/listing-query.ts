import type { Furnished, ListingFilters } from "./types";

const FURNISHED: Furnished[] = ["furnished", "partly", "unfurnished"];
const SORTS = ["newest", "price-asc", "price-desc", "size-desc"] as const;
const int = (v: string | undefined) => {
  const n = Number(v);
  return v && Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
};

/** URL search params -> validated filters. Unknown values are dropped, never trusted. */
export function parseFilters(sp: Record<string, string | string[] | undefined>): ListingFilters {
  const get = (k: string) => (Array.isArray(sp[k]) ? sp[k]?.[0] : sp[k]) as string | undefined;
  const district = get("district");
  const furnished = get("furnished") as Furnished | undefined;
  const sort = get("sort") as ListingFilters["sort"];
  return {
    district: district && /^[IVX]{1,5}$/.test(district) ? district : undefined,
    maxRent: int(get("maxRent")),
    minRooms: int(get("minRooms")),
    minSize: int(get("minSize")),
    furnished: furnished && FURNISHED.includes(furnished) ? furnished : undefined,
    pets: get("pets") === "1" ? true : undefined,
    sort: sort && SORTS.includes(sort) ? sort : undefined,
  };
}

/** Filters -> parameterised SQL. Only column names from this file reach the string. */
export function buildListingQuery(f: ListingFilters): { sql: string; params: unknown[] } {
  const where: string[] = ["status = 'active'"];
  const params: unknown[] = [];
  const add = (clause: string, value: unknown) => {
    params.push(value);
    where.push(clause.replace("?", `$${params.length}`));
  };
  if (f.district) add("district = ?", f.district);
  if (f.maxRent) add("rent_huf <= ?", f.maxRent);
  if (f.minRooms) add("(rooms + half_rooms * 0.5) >= ?", f.minRooms);
  if (f.minSize) add("size_m2 >= ?", f.minSize);
  if (f.furnished) add("furnished = ?", f.furnished);
  // "Pets" means: not explicitly refused by the owner.
  if (f.pets) where.push("pets_allowed is distinct from false");
  const order = {
    newest: "external_ref desc",
    "price-asc": "rent_huf asc",
    "price-desc": "rent_huf desc",
    "size-desc": "size_m2 desc",
  }[f.sort ?? "newest"];
  return { sql: `select * from listings where ${where.join(" and ")} order by ${order}, id`, params };
}

/** Filters -> query string (for links and the URL bar). */
export function filtersToSearch(f: ListingFilters): string {
  const p = new URLSearchParams();
  if (f.district) p.set("district", f.district);
  if (f.maxRent) p.set("maxRent", String(f.maxRent));
  if (f.minRooms) p.set("minRooms", String(f.minRooms));
  if (f.minSize) p.set("minSize", String(f.minSize));
  if (f.furnished) p.set("furnished", f.furnished);
  if (f.pets) p.set("pets", "1");
  if (f.sort && f.sort !== "newest") p.set("sort", f.sort);
  const s = p.toString();
  return s ? `?${s}` : "";
}
