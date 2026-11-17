# Budapest Luxury Apartments: concept redesign

A spec redesign of a real Budapest agency's website, built as a pitch. **Do not publish it.** It is unaffiliated, `noindex`, and meant to run on your own computer only. Every listing, photo, name and testimonial comes from the agency's public site. The photos load from the agency's own server, so you need an internet connection.

## Run it (Windows, Git Bash)

You need [Node.js 20 or newer](https://nodejs.org) (the LTS installer is fine). Then open **Git Bash** and paste one line at a time, pressing Enter after each:

```bash
cd ~/Desktop
```

```bash
git clone https://github.com/Thex006/realestate-demo.git
```

```bash
cd realestate-demo
```

```bash
git checkout feat/bla-site
```

```bash
npm install
```

```bash
npm run build
```

```bash
npm start
```

Open **http://localhost:3000** in your browser. Leave the Git Bash window open while you look around. Press `Ctrl + C` in it to stop.

Already cloned before? Skip the clone step and run `git pull` inside the folder instead.

## Pages

| Page | What it shows |
|---|---|
| `/` | 3D villa walkthrough driven by scroll, word by word tagline, 3D photo wall, collections bento, pinned horizontal sale rail, services story, owners, real testimonials, team |
| `/rent`, `/buy` | Filterable results. Every filter lives in the URL, so a shortlist can be shared |
| `/property/[slug]` | Gallery with full screen lightbox, facts, features, agent card, viewing request |
| `/owners` | Live valuation from the agency's own listings, then a valuation request |
| `/team`, `/legal` | The agency's people; privacy and terms for the concept |
| `/pitch` | Unlinked page for the meeting: what the live site loses today, checked on 17 Nov 2026 |

Form submissions are scored hot, warm or cold and stored in a local database (`.data/`, created automatically). In development, `GET /api/leads` lists them.

## Checks

```bash
npm run lint && npm test
```

End to end (with the site running on port 3000): `npm run test:e2e`. It needs `npx playwright install chromium` once.

## Stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind v4, Radix, motion, Lenis smooth scroll, three.js with React Three Fiber, Phosphor icons, PostgreSQL through embedded PGlite (set `DATABASE_URL` to use a real Postgres instead), zod.

Design rules come from `.claude/skills/landing-page-design` (elayadesign/ai-design-skills, MIT). See `PRODUCT.md` for the page plan and the two deliberate exceptions.
