import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";
import { agency } from "@/data/agency";
import { getAgentBySlug, searchListings } from "@/lib/db";
import { ListingCard } from "@/components/listings/listing-card";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = await getAgentBySlug((await params).slug);
  return { title: a ? `${a.name}, ${a.role}` : "Team" };
}

const initials = (name: string) => name.split(" ").map((p) => p[0]).join("");

export default async function AgentPage({ params }: Props) {
  const agent = await getAgentBySlug((await params).slug);
  if (!agent) notFound();
  const listings = (await searchListings({})).filter((l) => l.agentId === agent.id);
  const districts = new Set(listings.map((l) => l.district)).size;

  return (
    <div className="wrap pt-10">
      <div className="grid gap-4 lg:grid-cols-12">
        <section className="tile enter grid gap-6 p-6 md:grid-cols-[auto_1fr] md:p-8 lg:col-span-8">
          <div className="grid size-28 place-items-center display rounded-full border border-border-strong bg-card-2 text-5xl" aria-hidden>
            {initials(agent.name)}
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-accent">{agent.role}</p>
            <h1 className="display mt-3 text-6xl md:text-7xl">{agent.name}</h1>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">{agent.bio}</p>
          </div>
        </section>
        <aside className="tile enter grid content-between gap-4 p-6 lg:col-span-4" style={{ "--enter-delay": "80ms" } as React.CSSProperties}>
          <ul className="space-y-3 text-sm">
            <li><a className="num inline-flex items-center gap-2 hover:text-accent" href={`tel:${agent.phone.replace(/\s/g, "")}`}><Phone className="size-4" />{agent.phone}</a></li>
            <li><a className="inline-flex items-center gap-2 hover:text-accent" href={`mailto:${agent.email}`}><Mail className="size-4" />{agent.email}</a></li>
            <li className="inline-flex items-center gap-2 text-muted"><MapPin className="size-4" />{agency.address.street}, {agency.address.postcode} {agency.address.city}</li>
          </ul>
          <div className="num grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
            <div><p className="text-2xl font-semibold">{listings.length}</p><p className="text-[11px] text-muted">flats live</p></div>
            <div><p className="text-2xl font-semibold">{districts}</p><p className="text-[11px] text-muted">districts</p></div>
            <div><p className="text-2xl font-semibold">{agency.founded}</p><p className="text-[11px] text-muted">since</p></div>
          </div>
        </aside>
      </div>

      <section className="mt-12" aria-labelledby="agent-listings">
        <h2 id="agent-listings" className="display mb-8 text-5xl">Letting now with {agent.name.split(" ")[0]}</h2>
        <ul className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => <li key={l.id}><ListingCard listing={l} /></li>)}
        </ul>
      </section>
    </div>
  );
}
