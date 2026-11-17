import type { Metadata } from "next";
import { agency } from "@/data/agency";
import { searchListings } from "@/lib/db";
import { OwnerForm } from "@/components/forms/owner-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Let your Budapest flat",
  description: "See what your flat could let for, based on the flats we're letting today. Then let us find, vet and manage the tenant.",
};

export default async function OwnersPage() {
  const pool = await searchListings({});
  const comps = pool.map(({ district, sizeM2, rentHuf, propertyType }) => ({ district, sizeM2, rentHuf, propertyType }));

  return (
    <div className="wrap pt-10">
      <header className="enter mb-8 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="eyebrow">For owners</p>
          <h1 className="display mt-4 text-6xl md:text-8xl">What will your flat let for? <em>Know</em> in 20 seconds.</h1>
        </div>
        <p className="text-muted lg:col-span-4">
          The estimate below uses only the {pool.length} flats {agency.name} is letting right now, not national averages. Move the slider, see the number.
        </p>
      </header>

      <OwnerForm comps={comps} />

      <section className="mt-16" aria-labelledby="svc-h">
        <h2 id="svc-h" className="display mb-8 text-5xl">One office for everything after the estimate</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agency.services.map((s, i) => (
            <li key={s.key} className="tile p-5">
              <span className="display text-5xl text-accent">0{i + 1}</span>
              <h3 className="mt-6 text-lg font-medium">{s.title}</h3>
              <p className="mt-1 text-sm text-muted">{s.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
