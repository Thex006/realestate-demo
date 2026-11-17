"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/**
 * Pins the section and turns vertical scroll into a horizontal glide through the cards.
 * With reduced motion (or on narrow screens) it becomes a plain swipeable row.
 */
export function Rail({ header, children }: { header: React.ReactNode; children: React.ReactNode }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const t = track.current;
      if (!t) return;
      const wide = window.innerWidth >= 900;
      setPinned(wide && !reduce);
      setDistance(Math.max(0, t.scrollWidth - window.innerWidth + 48));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.05, 0.95], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0.05, 0.95], [0, 1]);

  return (
    <section ref={section} style={pinned ? { height: `calc(100svh + ${distance}px)` } : undefined} className="relative" aria-label="Homes for sale">
      <div className={pinned ? "sticky top-0 flex h-svh flex-col justify-center overflow-hidden" : "py-8"}>
        <div className="wrap mb-10">{header}</div>
        <motion.div ref={track} style={pinned ? { x } : undefined} className={`flex gap-6 pl-[max(16px,calc((100vw-1320px)/2))] pr-6 ${pinned ? "w-max" : "snap-x snap-mandatory overflow-x-auto pb-4"}`}>
          {children}
        </motion.div>
        {pinned && (
          <div className="wrap mt-10">
            <div className="h-px w-full bg-border">
              <motion.div style={{ scaleX: bar }} className="h-px origin-left bg-accent" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
