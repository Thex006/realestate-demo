/**
 * Public facts about Budapest Luxury Apartments (a Tower International brand), taken from
 * budapestluxuryapartments.towerbudapest.com on 17 Nov 2026. Nothing here is invented.
 */
export const agency = {
  name: "Budapest Luxury Apartments",
  short: "BLA",
  group: "Tower International",
  pitch: "Rent, buy and let luxury homes in Budapest",
  experienceYears: 15, // "over fifteen years of experience"
  address: { street: "Nádor utca 19", postcode: "1051", city: "Budapest", district: "V" },
  phones: { mobile: "+36 20 919 0005", office: "+36 1 336 1010" },
  sourceSite: "https://www.budapestluxuryapartments.towerbudapest.com",
  about:
    "With over fifteen years in the Budapest property market, Budapest Luxury Apartments helps international tenants and buyers find their home in the capital. The team sources quality homes for rent and for sale, and looks after owners who let them.",
  tenantServices: [
    { title: "One agency, the whole portfolio", body: "No juggling appointments with five agencies. Viewings and consultations are free, with one dedicated, multilingual agent through the whole search." },
    { title: "A lease that protects you", body: "A bilingual lease drafted by real estate lawyers, guidance through contracting, and someone from the team at the handover." },
    { title: "Backup after you move in", body: "Internet and TV, insurance, cleaning and maintenance arranged, and help talking to your landlord." },
  ],
  ownerServices: [
    { title: "Letting", body: "Photographers on the team, exclusive listings, and tenants from embassies, international companies and relocation agencies." },
    { title: "Property management", body: "Hundreds of homes under management, a dedicated account manager, online access to your property's information." },
    { title: "Sales", body: "Over 15 years selling luxury homes, free valuation without obligation, free advertising, comparative market analysis." },
    { title: "Investment", body: "Personal investment consultation, viewing trips, and yielding homes with sitting tenants." },
  ],
} as const;

/** The studio credited in the "concept redesign" note. Change this one line to rebrand the demo. */
export const STUDIO_NAME = "an independent web studio";

/** Client testimonials exactly as published on the agency's own site (first names as shown there). */
export const testimonials = [
  { quote: "I was looking for an apartment to rent for long-term in Budapest and used their services. Very professional agency with English customer service. Ms. Makkai was very kind and helpful and answered all my mails promptly.", name: "Daniel" },
  { quote: "We had a great experience with our agent, whom had been handling our requests with matter of urgency and professionalism, providing assistance 24/7.", name: "Dalma" },
  { quote: "We would highly recommend Daniel Holcsik to anyone looking for an apartment in Budapest! He exceeded our expectations in every way possible.", name: "Rick & Michelle" },
] as const;
