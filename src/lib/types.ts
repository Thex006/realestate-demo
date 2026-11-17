export type Kind = "rent" | "sale";
export type Furnished = "yes" | "no" | "optional" | "partly";

export interface Agent {
  id: string;
  slug: string;
  name: string;
  role: string;
  focus: string;
  phone: string;
  photoUrl: string;
}

export interface Listing {
  id: string; // "rent-104713"
  ref: string;
  kind: Kind;
  slug: string;
  type: "apartment" | "house";
  street: string;
  district: string; // Roman numeral
  neighbourhood: string;
  priceEur: number; // monthly rent or sale price
  sizeM2: number;
  bedrooms: number;
  bathrooms: number;
  view: string | null;
  furnished: Furnished | null;
  petFriendly: boolean | null;
  garage: boolean | null;
  elevator: boolean | null;
  airConditioning: boolean | null;
  alarm: boolean | null;
  sauna: boolean | null;
  pool: boolean | null;
  description: string;
  photos: string[];
  agent: string | null; // agent slug
  sourceUrl: string;
}

export interface ListingFilters {
  kind: Kind;
  district?: string;
  maxPrice?: number;
  minBedrooms?: number;
  type?: "apartment" | "house";
  view?: string;
  furnished?: boolean;
  pets?: boolean;
  garage?: boolean;
  sort?: "newest" | "price-asc" | "price-desc" | "size-desc";
}
