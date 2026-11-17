import type { Listing } from "@/lib/types";
import raw from "./listings.json";

/**
 * 45 live listings (23 to rent, 22 for sale) transcribed from the agency's public site on
 * 17 Nov 2026 by a scraper run once. Photos stay on the agency's own photo server and load at view time.
 */
export const listings = raw as Listing[];
