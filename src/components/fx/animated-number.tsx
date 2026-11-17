"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, useSpring, useTransform } from "motion/react";

/** A number that glides to each new value instead of jumping (spring, text only). */
export function AnimatedNumber({ value, format, className, testId }: { value: number; format: (n: number) => string; className?: string; testId?: string }) {
  const reduce = useReducedMotion();
  const spring = useSpring(value, { stiffness: 90, damping: 20 });
  const text = useTransform(spring, (v) => format(v));
  useEffect(() => {
    if (reduce) spring.jump(value);
    else spring.set(value);
  }, [value, reduce, spring]);
  return <motion.span className={className} data-testid={testId} data-value={value}>{text}</motion.span>;
}
