/**
 * Public facts about Lakáspont Ingatlaniroda (Flatpoint Kft.), taken from the agency's public
 * profile on alberlet.hu (en.alberlet.hu/ingatlaniroda/lakaspont), retrieved 17 Nov 2026.
 * Nothing here is invented: no reviews, no extra agents, no made-up awards.
 */
export const agency = {
  name: "Lakáspont",
  legalName: "Flatpoint Kft.",
  tagline: "Budapest rentals since 2002",
  founded: 2002,
  firstOffice: "Tátra utca, District XIII (August 2002)",
  address: { street: "Szerb utca 17.", postcode: "1056", city: "Budapest", district: "V" },
  phones: ["+36 70 384 5298", "+36 30 382 5380"],
  emails: { office: "admin@lpo.hu" },
  sourceProfile: "https://en.alberlet.hu/ingatlaniroda/lakaspont",
  /** Districts the agency names as its focus. */
  focusDistricts: ["I", "III", "V", "VI", "VII", "VIII", "IX", "XI"] as const,
  services: [
    { key: "renting", title: "Letting", body: "We find, screen and contract the tenant, then hand over the keys." },
    { key: "management", title: "Property management", body: "Rent collection, repairs and tenant changeovers, handled for you." },
    { key: "furnishing", title: "Furnishing", body: "Furnish an empty flat so it suits the tenants who are looking right now." },
    { key: "selling", title: "Sales", body: "Selling instead of letting? Same team, same districts." },
    { key: "insurance", title: "Insurance", body: "Cover that fits a let flat, not a generic home policy." },
    { key: "renovation", title: "Renovation advice", body: "What to fix before letting, and what tenants will actually pay for." },
  ],
} as const;

/** The studio credited in the "concept redesign" note. Change this one line to rebrand the demo. */
export const STUDIO_NAME = "an independent web studio";

/** Fixed rate for the "approx. €" labels. Matches the agency's own conversions (438,000 Ft ≈ €1,200). */
export const HUF_PER_EUR = 365;
