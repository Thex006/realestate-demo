import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Check } from "lucide-react";
import { agency, STUDIO_NAME } from "@/data/agency";
import { profileIssues } from "@/data/listings";
import { searchListings } from "@/lib/db";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Proposal" };

/** Sales page for the pitch meeting. Not linked from the site navigation. */
export default async function PitchPage() {
  const all = await searchListings({});
  const flagged = all.filter((l) => l.sourceIssues.length);
  const fixes = [
    "One brand, one domain, one site instead of lakaspont.hu + flatpoint.hu + lpo.hu",
    "Every flat shows rent + common charge + bills as one number",
    "Shareable search: district, budget, rooms, size, furnishing, pets",
    "Viewing requests scored hot / warm / cold before Monika picks up the phone",
    "Owner rent estimator built from your own live listings: a landlord lead magnet",
    "One data source, so a fee can never say two different things again",
  ];
  return (
    <div className="wrap pt-10">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-accent">Proposal for {agency.name} · by {STUDIO_NAME}</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-[-0.04em] md:text-6xl">
        {new Date().getFullYear() - agency.founded} years of downtown know-how deserve a website that sells it.
      </h1>
      <p className="mt-5 max-w-2xl text-lg text-muted">
        We rebuilt your rental site with your own {all.length} live listings. Here is what we found on the way, and what the new site fixes.
      </p>

      <div className="mt-10 grid gap-4 lg:grid-cols-12">
        <section className="tile p-6 lg:col-span-6" aria-labelledby="found-h">
          <h2 id="found-h" className="flex items-center gap-2 text-lg font-semibold"><AlertTriangle className="size-5 text-danger" /> What tenants see today</h2>
          <ul className="mt-5 space-y-3 text-sm text-muted">
            {profileIssues.map((i) => <li key={i} className="border-l-2 border-danger/50 pl-3">{i}</li>)}
            <li className="border-l-2 border-danger/50 pl-3">
              <span className="num font-medium text-foreground">{flagged.length} of {all.length}</span> live ads contradict themselves or leave key facts out (list below).
            </li>
          </ul>
        </section>
        <section className="tile p-6 lg:col-span-6" aria-labelledby="fix-h">
          <h2 id="fix-h" className="flex items-center gap-2 text-lg font-semibold"><Check className="size-5 text-ok" /> What this site does</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {fixes.map((f) => <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-accent" />{f}</li>)}
          </ul>
        </section>
        <section className="tile p-6 lg:col-span-12" aria-labelledby="ads-h">
          <h2 id="ads-h" className="text-lg font-semibold">Problems in live ads</h2>
          <ul className="mt-4 divide-y divide-border text-sm">
            {flagged.map((l) => (
              <li key={l.id} className="grid gap-1 py-3 md:grid-cols-[220px_1fr]">
                <Link href={`/rentals/${l.slug}`} className="font-medium hover:text-accent">{l.street} ({l.district})</Link>
                <span className="text-muted">{l.sourceIssues.join(" ")}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild size="lg"><Link href="/">See the new homepage</Link></Button>
        <Button asChild size="lg" variant="secondary"><Link href="/owners">Try the owner estimator</Link></Button>
      </div>
    </div>
  );
}
