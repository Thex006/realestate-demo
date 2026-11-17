import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { ConceptRibbon } from "@/components/site/concept-ribbon";
import { SmoothScroll } from "@/components/fx/smooth-scroll";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  openGraph: { type: "website", siteName: "Budapest Luxury Apartments (concept)", locale: "en_GB" },
  twitter: { card: "summary_large_image" },
  title: { default: "Budapest Luxury Apartments · Luxury homes to rent and buy in Budapest", template: "%s · Budapest Luxury Apartments" },
  description: "Handpicked apartments, penthouses and villas to rent and buy in Budapest, with one multilingual agent from the first viewing to the handover.",
  // Concept redesign of a real agency: never indexed, never published.
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-svh pb-10 font-sans antialiased">
        <a href="#main" className="sr-only z-[70] rounded-full bg-accent px-3 py-2 button-sm text-accent-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
        <SmoothScroll />
        <Nav />
        <main id="main" tabIndex={-1} className="outline-none">{children}</main>
        <Footer />
        <ConceptRibbon />
      </body>
    </html>
  );
}
