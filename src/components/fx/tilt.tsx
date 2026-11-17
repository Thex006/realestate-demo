"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Leans its child toward the pointer in 3D and moves a spotlight with it.
 * Springs keep it smooth; only transform and a CSS variable change.
 */
export function Tilt({ children, className, max = 6 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const cfg = { stiffness: 160, damping: 18, mass: 0.4 };
  const rotateY = useSpring(useTransform(x, [0, 1], [-max, max]), cfg);
  const rotateX = useSpring(useTransform(y, [0, 1], [max, -max]), cfg);

  function move(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    x.set(px);
    y.set(py);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }
  const leave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div style={{ perspective: 1200 }} className={className}>
      <motion.div ref={ref} onPointerMove={move} onPointerLeave={leave} style={{ rotateX, rotateY, transformStyle: "preserve-3d" }} className="spot relative h-full">
        {children}
      </motion.div>
    </div>
  );
}

/** Spotlight only (no tilt), for large bento tiles where tilting would feel seasick. */
export function Spotlight({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn("spot", className)}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
        e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      {children}
    </div>
  );
}
