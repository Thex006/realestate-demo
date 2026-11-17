/** A slow, endless band of words. The list is rendered twice so the loop is seamless. */
export function Marquee({ items, className = "" }: { items: string[]; className?: string }) {
  const row = (hidden: boolean) => (
    <ul className="flex shrink-0 items-center" aria-hidden={hidden || undefined}>
      {items.map((t, i) => (
        <li key={i} className="flex items-center">
          <span className="px-8">{t}</span>
          <span className="text-accent" aria-hidden>✦</span>
        </li>
      ))}
    </ul>
  );
  return (
    <div className={`overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)] ${className}`}>
      <div className="marquee">{row(false)}{row(true)}</div>
    </div>
  );
}
