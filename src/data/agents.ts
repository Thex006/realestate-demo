import type { Agent } from "@/lib/types";
import { agency } from "./agency";

const img = (f: string) => `${agency.sourceSite}/assets/img/about-us/${f}`;

/** The people the agency names on its site, with the photos it publishes of them. */
export const agents: Agent[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    slug: "fruzsina-czapko",
    name: "Fruzsina Czapko",
    role: "Sales Consultant",
    focus: "Rentals: the agent on every rental listed here",
    phone: agency.phones.mobile,
    photoUrl: img("fruzsina.jpg"),
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    slug: "reka-balint",
    name: "Reka Balint",
    role: "Sales Consultant",
    focus: "Rentals and sales",
    phone: agency.phones.mobile,
    photoUrl: img("reka2.jpg"),
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    slug: "janos-szell",
    name: "Janos Szell",
    role: "Investment Advisor",
    focus: "Sales and investment: the advisor on every home for sale listed here",
    phone: agency.phones.mobile,
    photoUrl: img("janos_szell.jpg"),
  },
];
