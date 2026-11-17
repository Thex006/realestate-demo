"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * The agency's own ad photo, loaded from alberlet.hu. If the image is missing or blocked, a
 * geometric district plate takes its place so the layout never breaks.
 */
export function ListingPhoto({
  src,
  alt,
  district,
  className,
  priority = false,
}: {
  src: string | null;
  alt: string;
  district: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(!src);
  const ref = useRef<HTMLImageElement>(null);
  // An image can fail before React hydrates and attaches onError; catch that case too.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  return (
    <div className={cn("relative overflow-hidden bg-card-2", className)}>
      {!failed && src ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote ad photo, not optimisable offline
        <img
          ref={ref}
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center" role="img" aria-label={`${alt} (photo on request)`}>
          <svg viewBox="0 0 200 120" className="absolute inset-0 size-full opacity-60" preserveAspectRatio="none" aria-hidden>
            {Array.from({ length: 9 }, (_, i) => (
              <line key={i} x1={i * 25} y1="0" x2={i * 25} y2="120" stroke="var(--border)" />
            ))}
            {Array.from({ length: 6 }, (_, i) => (
              <line key={i} x1="0" y1={i * 24} x2="200" y2={i * 24} stroke="var(--border)" />
            ))}
          </svg>
          <span className="relative text-5xl font-semibold tracking-[-0.04em] text-foreground/80">{district}</span>
        </div>
      )}
    </div>
  );
}
