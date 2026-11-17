# Product

<!-- impeccable:product-schema 1 -->

> Written from the agency brief without a live interview. Lines marked _(inferred)_ came from the brief, not from Thierry directly.

## Platform

web

## Users

- **Primary:** people renting long-term in central Budapest (expats, professionals, students and faculty near the universities, couples). They compare flats on rent, but get surprised by common charges, bills and deposits. _(inferred)_
- **Secondary:** flat owners in Districts V–IX, I, III and XI who want a tenant found and the flat managed.
- **Buyer of this site:** Lakáspont / Flatpoint Kft. management (Monika Stark, Managing Director).

## Product Purpose

A concept redesign of a real agency's site, made as an unsolicited pitch. Success means the agency sees its own listings presented far better than today and hires the studio. For visitors: book a viewing knowing the real monthly cost, or (as an owner) get a rent estimate and a call-back.

## Positioning

"Know the real cost before you view." Every flat shows rent, common charge and average bills as one number. Owners get a rent estimate based on the agency's own live listings.

## Operating Context

- Leads are stored in PostgreSQL (`leads`) with a 0–100 score and a hot, warm or cold tier.
- Runs locally only. It is never published or indexed, and every page carries the "Concept redesign, not affiliated" note.

## Capabilities and Constraints

- Stack (agency standard): Next.js App Router, React, TypeScript, Tailwind v4, shadcn/ui on Radix, motion/react, Node, PostgreSQL (PGlite locally).
- Motion animates transform and opacity only, and respects reduced motion.
- No paid services.

## Brand Commitments

- Agency name Lakáspont. Lacquer black with a Budapest-tram-yellow accent, Geist type, strict bento tiles.
- Voice: direct and concrete, with numbers and street names. No fluff.

## Evidence on Hand

- Real public data only: 18 listings, the office address, phone numbers and emails, and one named person. Source: the agency's alberlet.hu profile, retrieved 17 Nov 2026.
- **No testimonials, reviews, ratings, awards or extra staff exist. Never fabricate them.**

## Product Principles

1. Show the number people need (total monthly cost), not just the headline rent.
2. Never state a fact the ad didn't state: show "ask us" instead.
3. Every page has one clear next step: book a viewing, or get a rent estimate.

## Accessibility & Inclusion

WCAG 2.2 AA contrast and keyboard access for every control. Reduced-motion users get a page with nothing hidden. _(inferred)_
