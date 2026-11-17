"use client";

import { Fragment, useEffect, useRef } from "react";

/**
 * Large tagline whose words light up one at a time, in reading order, as they cross a line
 * 40% up from the bottom of the viewport (landing-page-design B11). One IntersectionObserver
 * watches every word; reduced motion shows the final text straight away via CSS.
 */
export function TaglineReveal({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const words = ref.current?.querySelectorAll<HTMLElement>(".tag-word");
    if (!words?.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          // Lit once it has crossed the trigger line; dims again only if scrolled back below it.
          if (e.isIntersecting || e.boundingClientRect.top < 0) el.setAttribute("data-on", "");
          else el.removeAttribute("data-on");
        }
      },
      { rootMargin: "0px 0px -40% 0px", threshold: 0 },
    );
    words.forEach((w) => io.observe(w));
    return () => io.disconnect();
  }, []);

  const parts = text.split(" ");
  return (
    <p ref={ref} className={className}>
      <span className="sr-only">{text.replace(/ \| /g, " ")}</span>
      <span aria-hidden>
        {parts.map((w, i) =>
          w === "|" ? <br key={i} /> : (
            <Fragment key={i}>
              <span className="tag-word">{w}</span>{i < parts.length - 1 && " "}
            </Fragment>
          ),
        )}
      </span>
    </p>
  );
}
