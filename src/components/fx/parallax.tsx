"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";

/** Moves its content slower than the page while it crosses the viewport. Wrap a cover photo in an overflow-hidden frame. */
export function Parallax({ children, amount = 12, className }: { children: React.ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={reduce ? undefined : { y, scale: 1 + (amount * 2.2) / 100 }} className="absolute inset-0">
        {children}
      </motion.div>
    </div>
  );
}
