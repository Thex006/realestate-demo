/* eslint-disable @next/next/no-img-element -- photos stay on the agency's own server; no optimiser offline */
import { cn } from "@/lib/utils";

/** One listing photo, cover-fitted. A neutral ground shows while it loads. */
export function Photo({ src, alt, className, priority = false, sizes }: { src: string; alt: string; className?: string; priority?: boolean; sizes?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      referrerPolicy="no-referrer"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("absolute inset-0 size-full bg-card-2 object-cover", className)}
    />
  );
}
