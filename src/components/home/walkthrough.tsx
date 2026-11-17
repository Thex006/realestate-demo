"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { ArrowDown } from "@phosphor-icons/react/ssr";
import { SplitWords } from "@/components/fx/split-words";
import { Photo } from "@/components/listings/photo";

const VillaScene = dynamic(() => import("@/components/three/villa-scene"), { ssr: false });

export type Chapter = { at: number; eyebrow: string; title: string; body: string; href: string; cta: string };

/** WebGL is available and not blocked: otherwise the hero falls back to a real listing photo. */
function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setOk(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/**
 * Pinned 3D walkthrough hero. Scrolling through the section drives the camera through an
 * illustrative villa; chapters about the real portfolio fade in at their stations.
 */
export function Walkthrough({ chapters, fallbackPhoto, rentCount, saleCount }: { chapters: Chapter[]; fallbackPhoto: string; rentCount: number; saleCount: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = !!useReducedMotion();
  const webgl = useWebGL();
  const inView = useInView(ref, { margin: "200px 0px 200px 0px" });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const introOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.06], [0, -48]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={ref} className="relative h-[700svh]" aria-label="Walk through a Budapest villa">
      <div className="sticky top-0 h-svh overflow-hidden bg-black">
        <div className="absolute inset-0">
          {webgl ? (
            <VillaScene progress={scrollYProgress} active={inView} still={reduce} />
          ) : webgl === false ? (
            <div className="absolute inset-0"><Photo src={fallbackPhoto} alt="" priority /></div>
          ) : null}
        </div>

        {/* Intro */}
        <motion.div style={reduce ? { opacity: introOpacity } : { opacity: introOpacity, y: introY }} className="wrap relative flex h-full flex-col justify-end pb-24">
          <p className="eyebrow enter text-white/80">Budapest · luxury homes for 15+ years</p>
          <h1 className="heading-2 hero-heading mt-4 max-w-[680px] md:heading-1">
            <SplitWords text="The Budapest home | you’d never find alone" delay={200} />
          </h1>
          <p className="enter mt-6 max-w-[680px] body-3 text-white/80" style={{ "--enter-delay": "0.8s" } as React.CSSProperties}>
            Apartments, penthouses and villas to rent and to buy. One multilingual agent shows you all of them, and viewings are free.
          </p>
          <div className="enter mt-8 flex flex-wrap gap-3" style={{ "--enter-delay": "1s" } as React.CSSProperties}>
            <HeroLink href="/rent" label="Homes to rent" count={rentCount} primary />
            <HeroLink href="/buy" label="Homes for sale" count={saleCount} />
          </div>
        </motion.div>
        <motion.p style={{ opacity: cueOpacity }} className="absolute bottom-16 right-[max(16px,4vw)] hidden items-center gap-2 caption-4 uppercase tracking-[0.2em] text-white/70 md:flex">
          Scroll to walk through <ArrowDown className="size-4" />
        </motion.p>

        {chapters.map((c, i) => (
          <ChapterCard key={c.title} c={c} progress={scrollYProgress} right={i % 2 === 1} />
        ))}

        <div className="absolute inset-x-0 bottom-12 wrap flex items-center gap-4">
          <p className="shrink-0 caption-5 text-white/60">Illustrative 3D model, not a specific listing</p>
          <div className="h-px flex-1 bg-white/15"><motion.div style={{ scaleX: bar }} className="h-px origin-left bg-accent" /></div>
        </div>
      </div>
    </section>
  );
}

function ChapterCard({ c, progress, right }: { c: Chapter; progress: MotionValue<number>; right: boolean }) {
  const opacity = useTransform(progress, [c.at - 0.05, c.at, c.at + 0.06, c.at + 0.1], [0, 1, 1, 0]);
  const y = useTransform(progress, [c.at - 0.05, c.at, c.at + 0.1], [32, 0, -32]);
  const events = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));
  return (
    <motion.div style={{ opacity, y, pointerEvents: events }} className={`absolute inset-x-0 top-1/2 -translate-y-1/2 wrap flex ${right ? "justify-end" : "justify-start"}`}>
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-black/60 p-6 backdrop-blur-xl">
        <p className="eyebrow">{c.eyebrow}</p>
        <h2 className="heading-4 mt-4 text-white">{c.title}</h2>
        <p className="mt-2 body-6 text-white/75">{c.body}</p>
        <Link href={c.href} className="mt-6 inline-flex rounded-full bg-white/10 px-3 py-2 button-sm text-white ring-1 ring-inset ring-white/20 transition-colors duration-300 hover:bg-accent hover:text-accent-ink">{c.cta}</Link>
      </div>
    </motion.div>
  );
}

function HeroLink({ href, label, count, primary }: { href: string; label: string; count: number; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full py-2 pl-4 pr-2 button-md transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] ${primary ? "bg-accent text-accent-ink hover:bg-[#d8bb84]" : "bg-white/10 text-white ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-white/20"}`}
    >
      {label}
      <span className={`num grid h-8 min-w-8 place-items-center rounded-full px-2 caption-3 ${primary ? "bg-black/15" : "bg-white/15"}`}>{count}</span>
    </Link>
  );
}
