# Lakáspont concept site

A concept redesign of the website of **Lakáspont Ingatlaniroda (Flatpoint Kft.)**, a Budapest rental agency (since 2002, Szerb utca 17, District V). We built it as an unsolicited pitch and a portfolio demo.

> **Not for publication.** This uses a real company's name, listings and photos without permission. Run it on your own computer or show it from a private preview only. Every page sends `noindex`, `robots.txt` blocks all crawlers, and a "Concept redesign, not affiliated" note sits on every page.

All data comes from the agency's public ads on alberlet.hu (retrieved 17 Nov 2026): 18 live listings and the one named person, Monika Stark (Managing Director). Nothing is invented: there are no fake reviews, agents or awards. Photos load directly from alberlet.hu, and a geometric placeholder appears if one is missing.

## Run it (free, nothing to sign up for)

```bash
npm install
npm run dev
```

Open http://localhost:3000. Pages:

| Page | What it shows |
| --- | --- |
| `/` | Bento homepage: search, featured flat, stats, districts, owner call to action, contact |
| `/rentals` | Search with filters for district, budget, rooms, size, furnishing and pets. Filters live in the URL, so a search can be shared |
| `/rentals/[slug]` | Listing page: facts, the **real monthly cost** (rent + common charge + bills), the money needed to move in, and a viewing request form |
| `/owners` | Live rent estimate built from the agency's own listings, plus a landlord lead form |
| `/team/monika-stark` | Agent profile |
| `/pitch` | Sales page for the pitch meeting: what is wrong today and what the new site fixes. It isn't linked from the site menu |

The database is **embedded Postgres (PGlite)**, stored in `.data/pglite`. Tables and seed data create themselves on the first request. To see stored leads with their score and tier, run `npm run dev` and open http://localhost:3000/api/leads (this only works in dev). To use a real Postgres instead, put `DATABASE_URL=...` in `.env.local`.

To change the studio name in the "Concept redesign by ..." note, edit `STUDIO_NAME` in `src/data/agency.ts`.

## Checks

```bash
npm test            # 19 unit tests: costs, rent estimate, lead scoring, filters, validation
npm run lint
npm run build
npm start           # then in a second terminal:
npm run test:e2e    # 18 browser checks (needs `npx playwright install chromium` once)
```

## Where things live

- `src/data/*`: the agency's public facts, its agents and its listings (with the contradictions we found in each ad)
- `src/lib/cost.ts`: real monthly cost and the money needed to move in
- `src/lib/estimate.ts`: owner rent estimate, based on median Ft/m² of comparable live listings, adjusted for size, condition, furnishing, lift and balcony
- `src/lib/lead-score.ts`: lead scores from 0 to 100, with a hot, warm or cold tier for each viewing request and owner enquiry
- `src/lib/listing-query.ts`: URL filters turned into parameterised SQL
- `src/lib/db.ts`, `db/001_schema.sql`: Postgres or PGlite, with tables `agents`, `listings` and `leads`
- `src/app/api/leads/route.ts`: validates, scores and stores leads (5 per minute per IP)
- `.claude/skills/`: design and engineering skills (taste, impeccable, typeui-minimal, playwright-cli, writing-guidelines, agent-skills)
