# Product notes

## Goal

Win Budapest Luxury Apartments as a client by showing their own homes, people and words in a site that feels like the homes cost what they cost, and that turns visitors into calls.

**One audience per page, one primary action:** tenants and buyers book a viewing; owners request a valuation.

## Page outline (home, layout A: classic hero plus sections)

1. **Hero:** "The Budapest home / you'd never find alone". Subheadline on one agent, free viewings and a bilingual lease. CTAs: Homes to rent (23), Homes for sale (22). Proof: 15+ years, 45 homes online, 8 districts, €0 viewing fee.
2. Neighbourhood marquee
3. Featured rentals (bento, tilt on hover)
4. **Tagline reveal:** the promise, each word lights up as it is scrolled into view
5. 3D photo wall of the agency's own photos, pinned while the plane turns
6. Collections bento (each count matches exactly what its link shows)
7. Sales on a pinned horizontal glide
8. How it works for tenants: three services, sticky heading, progress line
9. Owners: live estimate, then a free valuation request
10. Testimonials, quoted word for word from the agency's site
11. Team
12. Final CTA: call the team

## Effects (from Thierry's reference video)

Cinematic push in and light beams on the hero, words rising into place, a 3D tilted photo wall, parallax photos, a pinned horizontal rail, pointer tilt on cards, Lenis smooth scrolling and page fades. Everything animates transform or opacity only, and goes still with `prefers-reduced-motion`. The 3D is CSS rather than WebGL, because the agency's image server sends no CORS headers, so WebGL can't use the photos.

## Deliberate exceptions to landing-page-design

- **Hero light beams** are soft gradient shafts over the photo. They were the effect Thierry asked for in his reference video. Remove them by deleting the three `.beam` spans in `src/components/home/hero.tsx`.
- **The marquee** moves at a constant linear speed. Any easing curve would make an endless loop stutter.
- **The property page** has no skeleton, so a missing home returns a real 404 status. The rent and buy pages have skeletons.

## Honesty rules

- No invented reviews, numbers, people or claims. Facts come from the agency's site (`src/data/agency.ts` lists them).
- Agency photos are hotlinked, never committed.
- A concept note sits on every page, and the site is `noindex` with a disallow-all robots.txt.

## SEO

`noindex` everywhere on purpose. This is an unpublished pitch.
