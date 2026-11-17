import type { Metadata } from "next";
import Link from "next/link";
import { agency, STUDIO_NAME } from "@/data/agency";

export const metadata: Metadata = { title: "Privacy and terms" };

/** Plain-language privacy and terms for the concept build. Linked from the footer on every page. */
export default function LegalPage() {
  return (
    <div className="wrap max-w-[680px] pt-24">
      <p className="eyebrow">Legal</p>
      <h1 className="heading-2 mt-4">Privacy and terms</h1>

      <section id="privacy" className="mt-12 grid gap-4 body-3 text-muted">
        <h2 className="heading-5 text-foreground">Privacy</h2>
        <p>This is a concept redesign by {STUDIO_NAME}. It runs on a private computer for demonstration and is not published.</p>
        <p>Anything typed into a form here (name, email, phone, the home and your answers) is stored only in a local database on that computer, to show how the agency would receive and prioritise requests. Nothing is sent to {agency.name}, {agency.group} or anyone else, and no tracking or advertising cookies are used.</p>
        <p>To contact the real agency, call {agency.phones.office} or visit <a className="text-accent underline-offset-4 hover:underline" href={agency.sourceSite} target="_blank" rel="noreferrer">their website</a>.</p>
      </section>

      <section id="terms" className="mt-12 grid gap-4 body-3 text-muted">
        <h2 className="heading-5 text-foreground">Terms</h2>
        <p>Listings, photographs, names and testimonials come from {agency.name}&apos;s public website and remain theirs. Prices and availability may have changed since they were copied on 17 November 2026.</p>
        <p>Estimates on the owners page are calculated from the agency&apos;s own listings. They are a starting point, not a valuation or an offer.</p>
      </section>

      <Link href="/" className="mt-12 inline-block title-4 text-accent underline-offset-4 hover:underline">Back to the homepage</Link>
    </div>
  );
}
