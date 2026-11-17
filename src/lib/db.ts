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
 * Minimal query surface shared by real Postgres (pg) and embedded Postgres (PGlite).
 * - DATABASE_URL set   -> pg Pool (local Postgres, Neon, Supabase...)
 * - DATABASE_URL unset -> PGlite, Postgres compiled to WASM, persisted to ./.data/pglite (free, zero setup)
 */
interface Db {
  exec(sql: string): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
}

declare global {
  var __lakaspontDb: Promise<Db> | undefined;
}

async function connect(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (url) {
    const pool = new Pool({ connectionString: url, max: 3, ssl: /localhost|127\.0\.0\.1/.test(url) ? false : { rejectUnauthorized: false } });
    return {
      exec: async (sql) => void (await pool.query(sql)),
      query: async (sql, params = []) => (await pool.query(sql, params)).rows,
    };
  }
  const { PGlite } = await import("@electric-sql/pglite");
  const dir = process.env.PGLITE_DIR ?? path.join(process.cwd(), ".data", "pglite");
  mkdirSync(path.dirname(dir), { recursive: true });
  const lite = await PGlite.create(dir);
  return {
    exec: async (sql) => void (await lite.exec(sql)),
    query: async <T,>(sql: string, params: unknown[] = []) => (await lite.query<T>(sql, params)).rows,
  };
}

/** Upserts agents + listings from src/data so the DB always matches the transcribed public ads. */
async function seed(db: Db) {
  for (const a of seedAgents) {
    await db.query(
      `insert into agents (id, slug, name, role, phone, email, bio) values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (id) do update set slug=excluded.slug, name=excluded.name, role=excluded.role,
         phone=excluded.phone, email=excluded.email, bio=excluded.bio`,
      [a.id, a.slug, a.name, a.role, a.phone, a.email, a.bio],
    );
  }
  for (const l of seedListings) {
    await db.query(
      `insert into listings (id, external_ref, slug, title, property_type, district, neighbourhood, street, size_m2,
         rooms, half_rooms, floor, elevator, heating, furnished, condition, balcony, parking, pets_allowed,
         air_conditioning, available_from, available_now, rent_huf, common_charge_huf, utilities_est_huf,
         deposit_months, min_lease_months, summary, highlights, nearby, image_url, source_url, source_issues, agent_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34)
       on conflict (id) do update set external_ref=excluded.external_ref, slug=excluded.slug, title=excluded.title,
         property_type=excluded.property_type, district=excluded.district, neighbourhood=excluded.neighbourhood,
         street=excluded.street, size_m2=excluded.size_m2, rooms=excluded.rooms, half_rooms=excluded.half_rooms,
         floor=excluded.floor, elevator=excluded.elevator, heating=excluded.heating, furnished=excluded.furnished,
         condition=excluded.condition, balcony=excluded.balcony, parking=excluded.parking, pets_allowed=excluded.pets_allowed,
         air_conditioning=excluded.air_conditioning, available_from=excluded.available_from, available_now=excluded.available_now,
         rent_huf=excluded.rent_huf, common_charge_huf=excluded.common_charge_huf, utilities_est_huf=excluded.utilities_est_huf,
         deposit_months=excluded.deposit_months, min_lease_months=excluded.min_lease_months, summary=excluded.summary,
         highlights=excluded.highlights, nearby=excluded.nearby, image_url=excluded.image_url, source_url=excluded.source_url,
         source_issues=excluded.source_issues, agent_id=excluded.agent_id, updated_at=now()`,
      [
        l.id, l.externalRef, l.slug, l.title, l.propertyType, l.district, l.neighbourhood, l.street, l.sizeM2,
        l.rooms, l.halfRooms, l.floor, l.elevator, l.heating, l.furnished, l.condition, l.balcony, l.parking, l.petsAllowed,
        l.airConditioning, l.availableFrom, l.availableNow, l.rentHuf, l.commonChargeHuf, l.utilitiesEstHuf,
        l.depositMonths, l.minLeaseMonths, l.summary, JSON.stringify(l.highlights), JSON.stringify(l.nearby), l.imageUrl,
        l.sourceUrl, JSON.stringify(l.sourceIssues), l.agentId,
      ],
    );
  }
}

/** Connects once per server process, applies the schema and seeds (all idempotent). */
export function getDb(): Promise<Db> {
  if (!globalThis.__lakaspontDb) {
    globalThis.__lakaspontDb = (async () => {
      const db = await connect();
      await db.exec(readFileSync(path.join(process.cwd(), "db", "001_schema.sql"), "utf8"));
      await seed(db);
      return db;
    })().catch((err) => {
      globalThis.__lakaspontDb = undefined;
      throw err;
    });
  }
  return globalThis.__lakaspontDb;
}

type Row = Record<string, unknown>;
const toDate = (v: unknown) => (v == null ? null : v instanceof Date ? v.toISOString().slice(0, 10) : String(v).slice(0, 10));
const json = <T,>(v: unknown): T => (typeof v === "string" ? JSON.parse(v) : v) as T;

export function rowToListing(r: Row): Listing {
  return {
    id: String(r.id),
    externalRef: String(r.external_ref),
    slug: String(r.slug),
    title: String(r.title),
    propertyType: r.property_type as Listing["propertyType"],
    district: String(r.district),
    neighbourhood: String(r.neighbourhood),
    street: String(r.street),
    sizeM2: Number(r.size_m2),
    rooms: Number(r.rooms),
    halfRooms: Number(r.half_rooms),
    floor: (r.floor as string) ?? null,
    elevator: (r.elevator as boolean) ?? null,
    heating: (r.heating as string) ?? null,
    furnished: r.furnished as Listing["furnished"],
    condition: (r.condition as string) ?? null,
    balcony: (r.balcony as string) ?? null,
    parking: (r.parking as string) ?? null,
    petsAllowed: (r.pets_allowed as boolean) ?? null,
    airConditioning: Boolean(r.air_conditioning),
    availableFrom: toDate(r.available_from),
    availableNow: Boolean(r.available_now),
    rentHuf: Number(r.rent_huf),
    commonChargeHuf: r.common_charge_huf == null ? null : Number(r.common_charge_huf),
    utilitiesEstHuf: r.utilities_est_huf == null ? null : Number(r.utilities_est_huf),
    depositMonths: r.deposit_months == null ? null : Number(r.deposit_months),
    minLeaseMonths: r.min_lease_months == null ? null : Number(r.min_lease_months),
    summary: String(r.summary),
    highlights: json<string[]>(r.highlights),
    nearby: json<string[]>(r.nearby),
    imageUrl: (r.image_url as string) ?? null,
    sourceUrl: String(r.source_url),
    agentId: String(r.agent_id),
    sourceIssues: json<string[]>(r.source_issues),
  };
}

export async function searchListings(filters: ListingFilters): Promise<Listing[]> {
  const db = await getDb();
  const { sql, params } = buildListingQuery(filters);
  return (await db.query<Row>(sql, params)).map(rowToListing);
}

export async function getListingBySlug(slug: string): Promise<Listing | null> {
  const db = await getDb();
  const rows = await db.query<Row>("select * from listings where slug = $1 and status = 'active'", [slug]);
  return rows[0] ? rowToListing(rows[0]) : null;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const db = await getDb();
  const rows = await db.query<Row>("select * from listings where id = $1 and status = 'active'", [id]);
  return rows[0] ? rowToListing(rows[0]) : null;
}

export async function getAgentBySlug(slug: string): Promise<Agent | null> {
  const db = await getDb();
  const rows = await db.query<Agent>("select id, slug, name, role, phone, email, bio from agents where slug = $1", [slug]);
  return rows[0] ?? null;
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const db = await getDb();
  const rows = await db.query<Agent>("select id, slug, name, role, phone, email, bio from agents where id = $1", [id]);
  return rows[0] ?? null;
}

export async function insertLead(lead: Lead, score: LeadScore, extra: { listingId?: string; estimateHuf?: number }) {
  const db = await getDb();
  const { website: _hp, utmSource, utmCampaign, ...answers } = lead;
  void _hp;
  const rows = await db.query<{ id: string }>(
    `insert into leads (kind, listing_id, name, email, phone, answers, estimate_huf, lead_score, lead_tier, score_breakdown, utm_source, utm_campaign)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) returning id`,
    [
      lead.kind, extra.listingId ?? null, lead.name, lead.email, lead.phone ?? null, JSON.stringify(answers),
      extra.estimateHuf ?? null, score.score, score.tier, JSON.stringify(score.breakdown), utmSource ?? null, utmCampaign ?? null,
    ],
  );
  return rows[0];
}

export async function listLeads(limit = 50) {
  const db = await getDb();
  return db.query<Row>(
    `select l.created_at, l.kind, l.name, l.lead_score, l.lead_tier, l.estimate_huf, x.street as listing
       from leads l left join listings x on x.id = l.listing_id
      order by l.created_at desc limit $1`,
    [limit],
  );
}
