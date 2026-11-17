"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Facade } from "./facade";

/**
 * The agency's own ad photo, loaded from alberlet.hu. A facade drawing sits underneath while it
 * loads and stays if the photo is missing or blocked, so the layout never shows an empty box.
 */
export function ListingPhoto({
  src,
  alt,
  seed,
  className,
  priority = false,
}: {
  src: string | null;
  alt: string;
  seed: string;
  className?: string;
  priority?: boolean;
}) {
  const [state, setState] = useState<"loading" | "ok" | "failed">(src ? "loading" : "failed");
  const ref = useRef<HTMLImageElement>(null);
  // An image can settle before React hydrates and attaches its handlers; check once on mount.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete) setState(img.naturalWidth > 0 ? "ok" : "failed");
  }, []);

  return (
    <div className={cn("relative overflow-hidden bg-card-2", className)}>
      <Facade seed={seed} className="absolute inset-0 size-full" />
      {src && state !== "failed" && (
        // eslint-disable-next-line @next/next/no-img-element -- remote ad photo, not optimisable offline
        <img
          ref={ref}
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          onLoad={() => setState("ok")}
          onError={() => setState("failed")}
          className={cn(
            "absolute inset-0 size-full object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]",
            state === "ok" ? "opacity-100" : "opacity-0",
          )}
        />
      )}
      {state === "failed" && <span className="sr-only">{alt}</span>}
    </div>
  );
}
