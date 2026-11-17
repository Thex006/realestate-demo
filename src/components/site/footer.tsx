import Link from "next/link";
import { agency, STUDIO_NAME } from "@/data/agency";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="wrap grid gap-10 py-12 text-sm text-muted md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo className="text-foreground" />
          <p className="max-w-sm">
            {agency.legalName} · {agency.address.postcode} {agency.address.city}, {agency.address.street} · Renting downtown Budapest since {agency.founded}.
          </p>
        </div>
        <ul className="space-y-2">
          <li><Link className="hover:text-foreground" href="/rentals">All rentals</Link></li>
          <li><Link className="hover:text-foreground" href="/owners">Rent estimate for owners</Link></li>
          <li><Link className="hover:text-foreground" href="/team/monika-stark">Monika Stark</Link></li>
        </ul>
        <ul className="space-y-2">
          {agency.phones.map((p) => (
            <li key={p}><a className="num hover:text-foreground" href={`tel:${p.replace(/\s/g, "")}`}>{p}</a></li>
          ))}
          <li><a className="hover:text-foreground" href={`mailto:${agency.emails.office}`}>{agency.emails.office}</a></li>
        </ul>
      </div>
      <div className="border-t border-border">
        <p className="wrap py-5 text-xs text-muted-2">
          Concept redesign by {STUDIO_NAME}, made as an unsolicited proposal. Not affiliated with or endorsed by Lakáspont / {agency.legalName}. Listings, photos and contact details are taken from the agency&apos;s public ads and remain theirs. Not for publication.
        </p>
      </div>
    </footer>
  );
}
