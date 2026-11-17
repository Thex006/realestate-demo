import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validation";
import { scoreOwner, scoreViewing } from "@/lib/lead-score";
import { estimateRent } from "@/lib/estimate";
import { getListingById, insertLead, listLeads, searchListings } from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";

// 5 submissions per minute per IP stops form spam without bothering real people.
const allow = createRateLimiter({ limit: 5, windowMs: 60_000 });

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allow(ip)) {
    return NextResponse.json({ ok: false, error: "Too many requests. Please wait a minute and try again." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0] ?? "form"), i.message]));
    return NextResponse.json({ ok: false, fieldErrors }, { status: 422 });
  }
  const lead = parsed.data;
  if (lead.website) return NextResponse.json({ ok: true, tier: "cold" }); // honeypot: pretend, store nothing

  try {
    if (lead.kind === "viewing") {
      const listing = await getListingById(lead.listingId);
      if (!listing) return NextResponse.json({ ok: false, error: "That flat has just been let." }, { status: 404 });
      const score = scoreViewing(lead, listing);
      await insertLead(lead, score, { listingId: listing.id });
      return NextResponse.json({ ok: true, tier: score.tier });
    }
    const pool = await searchListings({});
    const estimate = estimateRent(lead, pool);
    const score = scoreOwner(lead);
    await insertLead(lead, score, { estimateHuf: estimate.mid });
    return NextResponse.json({ ok: true, tier: score.tier, estimate });
  } catch (err) {
    console.error("[leads] insert failed", err);
    return NextResponse.json({ ok: false, error: "We couldn't save that. Please try again in a minute." }, { status: 500 });
  }
}

/** Local inspection of stored leads with score and tier. Disabled in production builds. */
export async function GET() {
  if (process.env.NODE_ENV === "production") return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(await listLeads());
}
