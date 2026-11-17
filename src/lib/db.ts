import "server-only";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { Pool } from "pg";
import { agents as seedAgents } from "@/data/agents";
import { listings as seedListings } from "@/data/listings";
import { buildListingQuery } from "./listing-query";
import type { Agent, Listing, ListingFilters } from "./types";
import type { LeadScore } from "./lead-score";
import type { Lead } from "./validation";

/**
 * One query surface over real Postgres (DATABASE_URL set) or embedded PGlite
 * (Postgres compiled to WASM, persisted to ./.data/pglite; free, zero setup).
 */
interface Db {
  exec(sql: string): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
}

declare global {
  var __blaDb: Promise<Db> | undefined;
}

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = new Pool({ connectionString: url, max: 3, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } });
    return { exec: async (sql) => void (await pool.query(sql)), query: async (sql, params = []) => (await pool.query(sql, params)).rows };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  mkdirSync(path.dirname(dir), { recursive: true });
  const lite = await PGlite.create(dir);
  return { exec: async (sql) => void (await lite.exec(sql)), query: async <T,>(sql: string, params: unknown[] = []) => (await lite.query<T>(sql, params)).rows };
}

const agentIdBySlug = new Map(seedAgents.map((a) => [a.slug, a.id]));

/** Upserts agents, listings and photos from src/data so the DB always mirrors the transcribed site. */
async function seed(db: Db) {
  for (const a of seedAgents) {
    await db.query(
      `insert into agents (id, slug, name, role, focus, phone, photo_url) values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (id) do update set slug=excluded.slug, name=excluded.name, role=excluded.role, focus=excluded.focus, phone=excluded.phone, photo_url=excluded.photo_url`,
      [a.id, a.slug, a.name, a.role, a.focus, a.phone, a.photoUrl],
    );
  }
  for (const [i, l] of seedListings.entries()) {
    await db.query(
      `insert into listings (id, ref, kind, slug, position, type, street, district, neighbourhood, price_eur, size_m2, bedrooms, bathrooms,
         view, furnished, pet_friendly, garage, elevator, air_conditioning, alarm, sauna, pool, description, agent_id, source_url)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       on conflict (id) do update set slug=excluded.slug, position=excluded.position, type=excluded.type, street=excluded.street,
         district=excluded.district, neighbourhood=excluded.neighbourhood, price_eur=excluded.price_eur, size_m2=excluded.size_m2,
         bedrooms=excluded.bedrooms, bathrooms=excluded.bathrooms, view=excluded.view, furnished=excluded.furnished,
         pet_friendly=excluded.pet_friendly, garage=excluded.garage, elevator=excluded.elevator, air_conditioning=excluded.air_conditioning,
         alarm=excluded.alarm, sauna=excluded.sauna, pool=excluded.pool, description=excluded.description, agent_id=excluded.agent_id,
         source_url=excluded.source_url, updated_at=now()`,
      [l.id, l.ref, l.kind, l.slug, i, l.type, l.street, l.district, l.neighbourhood, l.priceEur, l.sizeM2, l.bedrooms, l.bathrooms,
        l.view, l.furnished, l.petFriendly, l.garage, l.elevator, l.airConditioning, l.alarm, l.sauna, l.pool, l.description,
        l.agent ? agentIdBySlug.get(l.agent) ?? null : null, l.sourceUrl],
    );
    await db.query("delete from listing_photos where listing_id = $1", [l.id]);
    for (const [pos, url] of l.photos.entries()) {
      await db.query("insert into listing_photos (listing_id, position, url) values ($1,$2,$3)", [l.id, pos, url]);
    }
  }
}

export function getDb(): Promise<Db> {
  if (!globalThis.__blaDb) {
    globalThis.__blaDb = (async () => {
      const db = await connect();
      await db.exec(readFileSync(path.join(process.cwd(), "db", "001_schema.sql"), "utf8"));
      await seed(db);
      return db;
    })().catch((err) => {
      globalThis.__blaDb = undefined;
      throw err;
    });
  }
  return globalThis.__blaDb;
}

type Row = Record<string, unknown>;
const slugById = new Map(seedAgents.map((a) => [a.id, a.slug]));

async function attach(db: Db, rows: Row[]): Promise<Listing[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => String(r.id));
  const photos = await db.query<{ listing_id: string; url: string }>(
    "select listing_id, url from listing_photos where listing_id = any($1) order by listing_id, position",
    [ids],
  );
  const byId = new Map<string, string[]>();
  for (const p of photos) byId.set(p.listing_id, [...(byId.get(p.listing_id) ?? []), p.url]);
  return rows.map((r) => ({
    id: String(r.id),
    ref: String(r.ref),
    kind: r.kind as Listing["kind"],
    slug: String(r.slug),
    type: r.type as Listing["type"],
    street: String(r.street),
    district: String(r.district),
    neighbourhood: String(r.neighbourhood),
    priceEur: Number(r.price_eur),
    sizeM2: Number(r.size_m2),
    bedrooms: Number(r.bedrooms),
    bathrooms: Number(r.bathrooms),
    view: (r.view as string) ?? null,
    furnished: (r.furnished as Listing["furnished"]) ?? null,
    petFriendly: (r.pet_friendly as boolean) ?? null,
    garage: (r.garage as boolean) ?? null,
    elevator: (r.elevator as boolean) ?? null,
    airConditioning: (r.air_conditioning as boolean) ?? null,
    alarm: (r.alarm as boolean) ?? null,
    sauna: (r.sauna as boolean) ?? null,
    pool: (r.pool as boolean) ?? null,
    description: String(r.description),
    photos: byId.get(String(r.id)) ?? [],
    agent: r.agent_id ? slugById.get(String(r.agent_id)) ?? null : null,
    sourceUrl: String(r.source_url),
  }));
}

export async function searchListings(f: ListingFilters): Promise<Listing[]> {
  const db = await getDb();
  const { sql, params } = buildListingQuery(f);
  return attach(db, await db.query<Row>(sql, params));
}

export async function allListings(): Promise<Listing[]> {
  const db = await getDb();
  return attach(db, await db.query<Row>("select * from listings where status = 'active' order by position"));
}

export async function getListing(slug: string): Promise<Listing | null> {
  const db = await getDb();
  return (await attach(db, await db.query<Row>("select * from listings where slug = $1 and status = 'active'", [slug])))[0] ?? null;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const db = await getDb();
  return (await attach(db, await db.query<Row>("select * from listings where id = $1 and status = 'active'", [id])))[0] ?? null;
}

export async function getAgents(): Promise<Agent[]> {
  const db = await getDb();
  const rows = await db.query<Row>("select * from agents order by id");
  return rows.map((r) => ({ id: String(r.id), slug: String(r.slug), name: String(r.name), role: String(r.role), focus: String(r.focus), phone: String(r.phone), photoUrl: String(r.photo_url) }));
}

export async function insertLead(lead: Lead, score: LeadScore, extra: { listingId?: string; estimateEur?: number }) {
  const db = await getDb();
  const { website: _hp, utmSource, utmCampaign, ...answers } = lead;
  void _hp;
  return (
    await db.query<{ id: string }>(
      `insert into leads (kind, listing_id, name, email, phone, answers, estimate_eur, lead_score, lead_tier, score_breakdown, utm_source, utm_campaign)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id`,
      [lead.kind, extra.listingId ?? null, lead.name, lead.email, lead.phone ?? null, JSON.stringify(answers), extra.estimateEur ?? null,
        score.score, score.tier, JSON.stringify(score.breakdown), utmSource ?? null, utmCampaign ?? null],
    )
  )[0];
}

export async function listLeads(limit = 50) {
  const db = await getDb();
  return db.query<Row>(
    `select l.created_at, l.kind, l.name, l.lead_score, l.lead_tier, l.estimate_eur, x.street as listing
       from leads l left join listings x on x.id = l.listing_id order by l.created_at desc limit $1`,
    [limit],
  );
}
