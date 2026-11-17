import { HUF_PER_EUR } from "@/data/agency";
import type { Listing } from "./types";

/** Deterministic thousands separator (Intl output differs between Node and browsers for hu-HU). */
const group = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

export const formatHuf = (n: number) => `${group(n)} Ft`;
export const formatEurApprox = (huf: number) => `≈ €${group(Math.round(huf / HUF_PER_EUR / 10) * 10)}`;
/** 438000 -> "438k Ft" */
export const formatHufShort = (n: number) =>
  n >= 1_000_000 ? `${(Math.round(n / 10_000) / 100).toString()}M Ft` : `${Math.round(n / 1000)}k Ft`;

export function roomsLabel(l: Pick<Listing, "rooms" | "halfRooms" | "propertyType">): string {
  if (l.propertyType === "studio") return "Studio";
  const half = l.halfRooms ? ` + ${l.halfRooms} half` : "";
  return `${l.rooms} room${l.rooms === 1 ? "" : "s"}${half}`;
}

export const furnishedLabel = { furnished: "Furnished", partly: "Part furnished", unfurnished: "Unfurnished" } as const;

export function availabilityLabel(l: Pick<Listing, "availableNow" | "availableFrom">, today = new Date()): string {
  if (l.availableNow) return "Available now";
  if (!l.availableFrom) return "Ask for date";
  const d = new Date(`${l.availableFrom}T00:00:00Z`);
  if (d <= today) return "Available now";
  return `From ${d.getUTCDate()} ${d.toLocaleString("en-GB", { month: "short", timeZone: "UTC" })}`;
}

const ROMAN: Record<string, number> = { I: 1, II: 2, III: 3, IV: 4, V: 5, VI: 6, VII: 7, VIII: 8, IX: 9, X: 10, XI: 11, XII: 12, XIII: 13, XIV: 14, XV: 15 };
export const districtNumber = (roman: string) => ROMAN[roman] ?? 0;
export const districtLabel = (roman: string) => `District ${roman}`;
