import Link from "next/link";
import { agency, STUDIO_NAME } from "@/data/agency";
import { Wordmark } from "./wordmark";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="wrap grid gap-12 py-16 body-6 text-muted md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Wordmark className="text-foreground" />
          <p className="max-w-xs">A {agency.group} brand. {agency.address.street}, {agency.address.postcode} {agency.address.city}.</p>
        </div>
        <FooterCol title="Homes" items={[["To rent", "/rent"], ["For sale", "/buy"], ["Houses", "/rent?type=house"]]} />
        <FooterCol title="Services" items={[["Free valuation", "/owners"], ["Our team", "/team"], ["Privacy", "/legal#privacy"], ["Terms", "/legal#terms"]]} />
        <div>
          <p className="mb-4 caption-5 uppercase tracking-[0.22em] text-muted-2">Call</p>
          <ul className="num space-y-2">
            <li><a className="hover:text-foreground" href={`tel:${agency.phones.mobile.replace(/\s/g, "")}`}>{agency.phones.mobile}</a></li>
            <li><a className="hover:text-foreground" href={`tel:${agency.phones.office.replace(/\s/g, "")}`}>{agency.phones.office}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="wrap py-6 caption-5 text-muted-2">
          Concept redesign by {STUDIO_NAME}, made as an unsolicited proposal. Not affiliated with or endorsed by Budapest Luxury Apartments or {agency.group}. Listings, photographs, names and testimonials come from the agency&apos;s public website and remain theirs. Not for publication.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <p className="mb-4 caption-5 uppercase tracking-[0.22em] text-muted-2">{title}</p>
      <ul className="space-y-2">
        {items.map(([l, h]) => <li key={h}><Link className="hover:text-foreground" href={h}>{l}</Link></li>)}
      </ul>
    </div>
  );
}
