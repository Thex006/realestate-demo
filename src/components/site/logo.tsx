/** Geometric mark: a door (rectangle) with a point (circle). Lakás + pont. */
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 24 24" className="size-6" aria-hidden>
        <rect x="4" y="2" width="16" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="15" cy="12.5" r="2.2" fill="var(--accent)" />
      </svg>
      <span className="text-[17px] font-semibold tracking-[-0.02em]">lakáspont</span>
    </span>
  );
}
