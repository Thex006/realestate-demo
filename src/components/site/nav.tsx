"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Phone } from "@phosphor-icons/react/ssr";
import { agency } from "@/data/agency";
import { cn } from "@/lib/utils";
import { Wordmark } from "./wordmark";

const links = [
  { href: "/rent", label: "Rent" },
  { href: "/buy", label: "Buy" },
  { href: "/owners", label: "Owners" },
  { href: "/team", label: "Team" },
];
const EASE = [0.22, 1, 0.36, 1] as const;
const tel = `tel:${agency.phones.mobile.replace(/\s/g, "")}`;

/** Floating, content-sized pill nav (landing-page-design B7) with a full-height mobile menu. */
export function Nav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const isCurrent = (href: string) => path === href || path.startsWith(`${href}/`);

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex items-center gap-6 rounded-full border border-border bg-card/70 py-2 pl-4 pr-2 backdrop-blur-xl" aria-label="Main">
        <Link href="/" aria-label="Budapest Luxury Apartments home" className="rounded-md"><Wordmark /></Link>
        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isCurrent(l.href) ? "page" : undefined}
                className={cn("rounded-full px-3 py-2 title-4 transition-colors duration-300", isCurrent(l.href) ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground")}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <a href={tel} className="num hidden items-center gap-2 rounded-full bg-accent px-3 py-2 button-sm text-accent-ink transition-[background-color,transform] duration-300 hover:bg-[#d8bb84] active:scale-[0.98] md:inline-flex">
          <Phone className="size-4" weight="bold" /> {agency.phones.mobile}
        </a>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="relative grid size-10 place-items-center rounded-full bg-white/10 md:hidden"
        >
          <span className={cn("absolute h-0.5 w-4 rounded-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", open ? "rotate-45" : "-translate-y-1")} />
          <span className={cn("absolute h-0.5 w-4 rounded-full bg-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", open ? "-rotate-45" : "translate-y-1")} />
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 -z-10 flex flex-col justify-between bg-black/90 px-6 pb-24 pt-24 backdrop-blur-2xl md:hidden"
          >
            <ul className="grid gap-2">
              {links.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: Math.min(i * 0.06, 0.4) }}
                >
                  <Link href={l.href} aria-current={isCurrent(l.href) ? "page" : undefined} className={cn("block py-2 heading-2", isCurrent(l.href) ? "text-accent" : "text-foreground")}>
                    {l.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <a href={tel} className="num inline-flex w-fit items-center gap-2 rounded-full bg-accent px-3 py-2 button-md text-accent-ink">
              <Phone className="size-4" weight="bold" /> Call {agency.phones.mobile}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
