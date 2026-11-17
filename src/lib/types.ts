export type Furnished = "furnished" | "partly" | "unfurnished";
export type PropertyType = "flat" | "house" | "studio" | "commercial-ready";

export interface Agent {
  id: string;
  slug: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  bio: string;
}

export interface Listing {
  id: string;
  /** alberlet.hu listing number */
  externalRef: string;
  slug: string;
  title: string;
  propertyType: PropertyType;
  district: string; // Roman numeral, e.g. "V"
  neighbourhood: string;
  street: string;
  sizeM2: number;
  rooms: number; // full rooms
  halfRooms: number;
  floor: string | null;
  elevator: boolean | null;
  heating: string | null;
  furnished: Furnished;
  condition: string | null;
  balcony: string | null;
  parking: string | null;
  /** null = not stated by the landlord */
  petsAllowed: boolean | null;
  airConditioning: boolean;
  availableFrom: string | null; // ISO date; null = ask
  availableNow: boolean;
  rentHuf: number;
  commonChargeHuf: number | null;
  utilitiesEstHuf: number | null;
  depositMonths: number | null;
  minLeaseMonths: number | null;
  summary: string;
  highlights: string[];
  nearby: string[];
  imageUrl: string | null;
  sourceUrl: string;
  agentId: string;
  /** Contradictions found in the original public ad (used on the /pitch page only). */
  sourceIssues: string[];
}

export interface ListingFilters {
  district?: string;
  maxRent?: number;
  minRooms?: number;
  minSize?: number;
  furnished?: Furnished;
  pets?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "size-desc";
}
