import { Label } from "@/components/ui/label";

export function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-err`} className="caption-5 text-danger" role="alert">{error}</p>
      ) : hint ? (
        <p className="caption-5 text-muted-2">{hint}</p>
      ) : null}
    </div>
  );
}

/** Off-screen honeypot. Real people never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
