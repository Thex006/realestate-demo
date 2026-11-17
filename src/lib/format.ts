import type { Listing } from "./types";

const group = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatEur = (n: number) => `€${group(n)}`;
/** 890400 -> "€890k", 1250000 -> "€1.25M" */
export const formatEurShort = (n: number) =>
  n >= 1_000_000 ? `€${Math.round(n / 10_000) / 100}M` : n >= 10_000 ? `€${Math.round(n / 1000)}k` : formatEur(n);

export const priceLabel = (l: Pick<Listing, "kind" | "priceEur">) => (l.kind === "rent" ? `${formatEur(l.priceEur)} / month` : formatEur(l.priceEur));

export const bedsLabel = (n: number) => (n === 0 ? "Studio" : `${n} bed${n === 1 ? "" : "s"}`);

const ROMAN: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14 };
export const districtNumber = (r: string) => ROMAN[r] ?? 0;

/** A plain-language headline from the listing's own facts. */
export function headline(l: Pick<Listing, "type" | "bedrooms" | "view" | "sizeM2">): string {
  const name = l.view === "River Danube" ? "Danube" : l.view === "Buda Hills" ? "Buda Hills" : l.view?.toLowerCase();
  const view = l.view && !["Street", "Courtyard"].includes(l.view) ? ` with ${name} view` : "";
  const what = l.type === "house" ? "house" : l.bedrooms === 0 ? "studio" : "apartment";
  return `${l.bedrooms ? `${l.bedrooms} bedroom ` : ""}${what}${view}, ${l.sizeM2} m²`;
}
