import type { MetadataRoute } from "next";

/** Concept redesign of a real agency's site: keep every crawler out. */
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", disallow: "/" }] };
}
