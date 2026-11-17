"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowDown, ArrowUpRight } from "@phosphor-icons/react/ssr";
import { SplitWords } from "@/components/fx/split-words";
import { Photo } from "@/components/listings/photo";

/**
 * Full-bleed cinematic hero: a real listing photo pushes in slowly under drifting light beams,
 * the headline rises word by word, and scrolling sinks the photo while the type lifts away.
 */
export function Hero({ photo, caption, rentCount, saleCount }: { photo: string; caption: { street: string; href: string }; rentCount: number; saleCount: number }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative isolate h-svh min-h-[640px] overflow-hidden" aria-label="Introduction">
      <motion.div style={reduce ? undefined : { y: photoY }} className="absolute inset-0 -z-10">
        <div className="pushin absolute inset-0">
          <Photo src={photo} alt="" priority />
        </div>
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-black/55" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
        <span className="beam left-[8%]" style={{ "--beam-rot": "16deg", "--beam-dur": "18s" } as React.CSSProperties} />
        <span className="beam left-[38%] w-[10%] opacity-70" style={{ "--beam-rot": "22deg", "--beam-dur": "13s" } as React.CSSProperties} />
        <span className="beam left-[66%] w-[24%] opacity-60" style={{ "--beam-rot": "12deg", "--beam-dur": "21s" } as React.CSSProperties} />
      </div>

      <motion.div style={reduce ? undefined : { y: textY, opacity: fade }} className="wrap flex h-full flex-col justify-end pb-12 md:pb-20">
        <p className="eyebrow enter text-white/80" style={{ "--enter-delay": "0.1s" } as React.CSSProperties}>Budapest · luxury homes for 15+ years</p>
        <h1 className="heading-1 hero-heading mt-6 max-w-[680px]">
          <SplitWords text="The Budapest home | you’d never find alone" delay={200} />
        </h1>
        <div className="enter mt-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between" style={{ "--enter-delay": "0.9s" } as React.CSSProperties}>
          <p className="max-w-[680px] body-3 text-white/75 md:max-w-md">
            Apartments, penthouses and villas to rent and to buy. One multilingual agent shows you all of them, viewings are free, and your lease is drafted in two languages by real estate lawyers.
          </p>
          <div className="flex flex-wrap gap-3">
            <HeroLink href="/rent" label="Homes to rent" count={rentCount} primary />
            <HeroLink href="/buy" label="Homes for sale" count={saleCount} />
          </div>
        </div>
      </motion.div>

      <Link href={caption.href} className="enter absolute bottom-6 right-[max(16px,4vw)] hidden items-center gap-2 caption-4 uppercase tracking-[0.2em] text-white/60 transition-colors hover:text-white lg:flex" style={{ "--enter-delay": "1.4s" } as React.CSSProperties}>
        Pictured: {caption.street} <ArrowUpRight className="size-3.5" />
      </Link>
      <ArrowDown className="enter absolute bottom-6 left-1/2 hidden size-4 -translate-x-1/2 text-white/50 md:block" style={{ "--enter-delay": "1.6s" } as React.CSSProperties} aria-hidden />
    </section>
  );
}

function HeroLink({ href, label, count, primary }: { href: string; label: string; count: number; primary?: boolean }) {
  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full py-2 pl-4 pr-2 button-md transition-[background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] ${primary ? "bg-accent text-accent-ink hover:bg-[#d8bb84]" : "bg-white/10 text-white ring-1 ring-inset ring-white/25 backdrop-blur-md hover:bg-white/20"}`}
    >
      {label}
      <span className={`num grid h-8 min-w-8 place-items-center rounded-full px-2 caption-3 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 ${primary ? "bg-black/15" : "bg-white/15"}`}>{count}</span>
    </Link>
  );
}
