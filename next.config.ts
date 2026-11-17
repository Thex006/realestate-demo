import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root so a stray package-lock.json in a parent folder (e.g. the user folder) is ignored.
  outputFileTracingRoot: process.cwd(),
  // PGlite ships WASM + data files; load it from node_modules instead of bundling.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Ship the schema with every server route so the DB can self-migrate on first request.
  outputFileTracingIncludes: { "/**": ["./db/**/*.sql"] },
  // Concept redesign of a real agency: belt-and-braces noindex on every response.
  async headers() {
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] }];
  },
};

export default nextConfig;
