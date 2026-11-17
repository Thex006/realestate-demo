import { STUDIO_NAME } from "@/data/agency";

/** Honest framing for a spec redesign: always visible, never dismissable. */
export function ConceptRibbon() {
  return (
    <div className="border-b border-border bg-card-2/60 text-[12px] text-muted">
      <p className="wrap py-2 text-center">
        Concept redesign by {STUDIO_NAME}. Not affiliated with or endorsed by Lakáspont / Flatpoint Kft. Listing data from their public ads.
      </p>
    </div>
  );
}
