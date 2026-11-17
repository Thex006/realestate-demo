/**
 * Deterministic line drawing of a Budapest tenement facade at dusk, seeded per listing.
 * Used while a photo loads or when the ad has none, so no tile is ever an empty box.
 */
function rng(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function Facade({ seed, className = "" }: { seed: string; className?: string }) {
  const r = rng(seed);
  const cols = 4 + Math.floor(r() * 3); // 4-6 window bays
  const floors = 4 + Math.floor(r() * 2); // 4-5 storeys
  const W = 400;
  const H = 300;
  const left = 40;
  const right = W - 40;
  const top = 46 + r() * 18;
  const bottom = H - 8;
  const bay = (right - left) / cols;
  const floorH = (bottom - top - 40) / floors;
  const ww = bay * 0.42;
  const wh = floorH * 0.56;
  const balconyFloor = 1 + Math.floor(r() * (floors - 1));
  const line = "rgb(243 238 228 / 0.22)";

  const windows: React.ReactNode[] = [];
  for (let f = 0; f < floors; f++) {
    for (let c = 0; c < cols; c++) {
      const x = left + c * bay + (bay - ww) / 2;
      const y = top + 14 + f * floorH + (floorH - wh) / 2;
      const lit = r() < 0.28;
      const arched = f === 0 && r() < 0.7;
      windows.push(
        <g key={`${f}-${c}`}>
          {arched ? (
            <path d={`M${x} ${y + wh} V${y + ww / 2} A${ww / 2} ${ww / 2} 0 0 1 ${x + ww} ${y + ww / 2} V${y + wh} Z`} fill={lit ? "rgb(255 210 0 / 0.38)" : "rgb(0 0 0 / 0.25)"} stroke={line} />
          ) : (
            <rect x={x} y={y} width={ww} height={wh} fill={lit ? "rgb(255 210 0 / 0.38)" : "rgb(0 0 0 / 0.25)"} stroke={line} />
          )}
          <line x1={x + ww / 2} y1={y + (arched ? ww / 2 : 0)} x2={x + ww / 2} y2={y + wh} stroke={line} />
          <line x1={x - 3} y1={y - 5} x2={x + ww + 3} y2={y - 5} stroke={line} />
          {f === balconyFloor && (
            <g stroke={line}>
              <line x1={x - 6} y1={y + wh + 2} x2={x + ww + 6} y2={y + wh + 2} />
              {Array.from({ length: 6 }, (_, i) => (
                <line key={i} x1={x - 6 + (i * (ww + 12)) / 5} y1={y + wh + 2} x2={x - 6 + (i * (ww + 12)) / 5} y2={y + wh - 10} />
              ))}
              <line x1={x - 6} y1={y + wh - 10} x2={x + ww + 6} y2={y + wh - 10} />
            </g>
          )}
        </g>,
      );
    }
  }

  const doorX = left + Math.floor(cols / 2) * bay + bay * 0.2;
  const doorW = bay * 0.6;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className={className} aria-hidden>
      <defs>
        <linearGradient id={`sky-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1a22" />
          <stop offset="0.65" stopColor="#2b2219" />
          <stop offset="1" stopColor="#3a2a17" />
        </linearGradient>
        <radialGradient id={`glow-${seed}`} cx="0.5" cy="1" r="0.8">
          <stop offset="0" stopColor="rgb(255 190 90 / 0.35)" />
          <stop offset="1" stopColor="rgb(255 190 90 / 0)" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#sky-${seed})`} />
      <rect width={W} height={H} fill={`url(#glow-${seed})`} />
      {/* Body, cornice and roof */}
      <rect x={left - 8} y={top} width={right - left + 16} height={bottom - top} fill="rgb(255 255 255 / 0.03)" stroke={line} />
      <line x1={left - 14} y1={top + 8} x2={right + 14} y2={top + 8} stroke={line} />
      <line x1={left - 14} y1={top + 2} x2={right + 14} y2={top + 2} stroke={line} />
      <path d={`M${left - 8} ${top} L${left + 20} ${top - 22} H${right - 20} L${right + 8} ${top}`} fill="rgb(0 0 0 / 0.2)" stroke={line} />
      {windows}
      {/* Gate */}
      <path d={`M${doorX} ${bottom} V${bottom - 30} A${doorW / 2} ${doorW / 2} 0 0 1 ${doorX + doorW} ${bottom - 30} V${bottom}`} fill="rgb(0 0 0 / 0.45)" stroke={line} />
    </svg>
  );
}
