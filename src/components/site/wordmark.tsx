/** Type-only wordmark: the agency's name in the site typeface over a spaced caps line. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`flex flex-col leading-none ${className}`}>
      <span className="title-3 tracking-[-0.01em]">Budapest Luxury</span>
      <span className="mt-1 caption-3 tracking-[0.3em] text-accent">APARTMENTS</span>
    </span>
  );
}
