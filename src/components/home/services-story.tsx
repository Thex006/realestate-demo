"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll } from "motion/react";
import { Reveal } from "@/components/ui/reveal";

/** Sticky heading on the left, services scrolling past on the right, a champagne line tracing progress. */
export function ServicesStory({ eyebrow, title, items }: { eyebrow: string; title: React.ReactNode; items: readonly { title: string; body: string }[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });

  return (
    <div ref={ref} className="wrap grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-32">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="heading-2 mt-6">{title}</h2>
        </div>
      </div>
      <div className="relative lg:col-span-6 lg:col-start-7">
        <div className="absolute bottom-0 left-0 top-0 w-px bg-border" aria-hidden>
          <motion.div style={reduce ? undefined : { scaleY: scrollYProgress }} className="h-full w-px origin-top bg-accent" />
        </div>
        <ol className="grid gap-24 py-6 pl-10 md:gap-24">
          {items.map((s, i) => (
            <li key={s.title}>
              <Reveal>
                <p className="heading-1 num text-accent/70">0{i + 1}</p>
                <h3 className="heading-3 mt-6">{s.title}</h3>
                <p className="mt-4 max-w-md text-muted">{s.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
