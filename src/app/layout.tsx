import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { ConceptRibbon } from "@/components/site/concept-ribbon";
import "@fontsource/instrument-serif/latin-400.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Lakáspont · Budapest rentals with the real monthly cost up front", template: "%s · Lakáspont" },
  description:
    "Long-term rentals in central Budapest since 2002. Every flat shows rent, common charge and bills together, so you know what you'll pay before the viewing.",
  // Concept redesign: never indexed, never published.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-svh font-sans antialiased">
        <ConceptRibbon />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
