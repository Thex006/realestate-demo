import type { Metadata } from "next";
import { Phone } from "@phosphor-icons/react/ssr";
import { agency } from "@/data/agency";
import { getAgents } from "@/lib/db";
import { Photo } from "@/components/listings/photo";
import { SplitWords } from "@/components/fx/split-words";
import { Tilt } from "@/components/fx/tilt";
import { Reveal } from "@/components/ui/reveal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "The team" };

export default async function TeamPage() {
  const agents = await getAgents();
  return (
    <div className="wrap pt-24">
      <header className="mb-16 grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-8">
          <p className="eyebrow enter">The team</p>
          <h1 className="heading-1 mt-4"><SplitWords text="People, not a *portal*." /></h1>
        </div>
        <p className="enter text-muted lg:col-span-4" style={{ "--enter-delay": "0.6s" } as React.CSSProperties}>{agency.about}</p>
      </header>
      <div className="grid gap-10 md:grid-cols-3">
        {agents.map((a, i) => (
          <Reveal key={a.id} delay={0.08 * i}>
            <Tilt max={5}>
              <article className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-card-2">
                  <Photo src={a.photoUrl} alt={a.name} className="grayscale transition-[filter,transform] duration-700 group-hover:scale-[1.03] group-hover:grayscale-0" />
                </div>
                <h2 className="heading-3 mt-6">{a.name}</h2>
                <p className="mt-1 caption-5 uppercase tracking-[0.16em] text-accent">{a.role}</p>
                <p className="mt-3 body-6 text-muted">{a.focus}</p>
                <a href={`tel:${a.phone.replace(/\s/g, "")}`} className="num mt-4 inline-flex items-center gap-2 body-6 text-muted transition-colors hover:text-accent"><Phone className="size-3.5" /> {a.phone}</a>
              </article>
            </Tilt>
          </Reveal>
        ))}
      </div>
      <p className="mt-16 max-w-xl body-6 text-muted-2">
        Visit the office at {agency.address.street}, {agency.address.postcode} {agency.address.city} (District {agency.address.district}), or call {agency.phones.office}.
      </p>
    </div>
  );
}
