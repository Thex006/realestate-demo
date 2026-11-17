"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { Photo } from "@/components/listings/photo";

type Tile = { src: string; href: string; label: string };

/**
 * A wall of the agency's real photos laid on a tilted plane in 3D space. While the section is pinned,
 * scrolling slides the columns past each other and slowly turns the plane toward the viewer.
 */
export function PhotoWall({ tiles, children }: { tiles: Tile[]; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const rotateX = useTransform(scrollYProgress, [0, 1], [52, 30]);
  const rotateZ = useTransform(scrollYProgress, [0, 1], [-30, -16]);
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 0.92]);
  const cols = [0, 1, 2, 3, 4].map((c) => tiles.filter((_, i) => i % 5 === c));

  return (
    <section ref={ref} className="relative h-[260vh]" aria-label="The portfolio">
      <div className="sticky top-0 h-svh overflow-hidden">
        <div className="absolute inset-0 grid place-items-center [perspective:1800px] [mask-image:linear-gradient(180deg,transparent,#000_18%,#000_82%,transparent)]" aria-hidden>
          <motion.div
            style={reduce ? { rotateX: 40, rotateZ: -22 } : { rotateX, rotateZ, scale }}
            className="grid w-[150vw] max-w-[2200px] grid-cols-5 gap-4 [transform-style:preserve-3d] md:w-[120vw]"
          >
            {cols.map((col, c) => (
              <Column key={c} tiles={col} progress={scrollYProgress} dir={c % 2 ? 1 : -1} still={!!reduce} />
            ))}
          </motion.div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-black/25" aria-hidden />
        <div className="relative grid h-full place-items-center px-4 text-center">
          <div className="rounded-2xl border border-border bg-black/70 px-6 py-12 backdrop-blur-xl md:px-16">{children}</div>
        </div>
      </div>
    </section>
  );
}

function Column({ tiles, progress, dir, still }: { tiles: Tile[]; progress: MotionValue<number>; dir: number; still: boolean }) {
  const y = useTransform(progress, [0, 1], [`${-12 * dir}%`, `${12 * dir}%`]);
  return (
    <motion.div style={still ? undefined : { y }} className="grid gap-4">
      {tiles.map((t) => (
        <Link key={t.src} href={t.href} tabIndex={-1} className="pointer-events-auto relative block aspect-[4/5] overflow-hidden rounded-md bg-card-2 shadow-[0_40px_80px_-20px_rgb(0_0_0/0.8)]">
          <Photo src={t.src} alt="" />
        </Link>
      ))}
    </motion.div>
  );
}
