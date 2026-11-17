import { STUDIO_NAME } from "@/data/agency";

/** Honest framing for a spec redesign: pinned to the bottom of every page, never dismissable. */
export function ConceptRibbon() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-black/90 backdrop-blur-md">
      <p className="wrap py-2 text-center caption-5 text-muted">
        Concept redesign by {STUDIO_NAME}. Not affiliated with or endorsed by Budapest Luxury Apartments or Tower International.
      </p>
    </div>
  );
}
