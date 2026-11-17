"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { KeyRound } from "lucide-react";
import { estimateRent, type EstimateInput } from "@/lib/estimate";
import { formatEurApprox, formatHuf } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Field, Honeypot } from "./field";
import { useLeadSubmit } from "./use-lead-submit";

type Comp = Pick<Listing, "district" | "sizeM2" | "rentHuf" | "propertyType">;
const DISTRICTS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];

/** Live rent estimate from the agency's own listings; contact details unlock a call-back. */
export function OwnerForm({ comps }: { comps: Comp[] }) {
  const [input, setInput] = useState<EstimateInput>({ district: "VI", sizeM2: 55, furnished: "furnished", condition: "renovated", elevator: true, balcony: false });
  const [readiness, setReadiness] = useState("");
  const [management, setManagement] = useState(true);
  const est = useMemo(() => estimateRent(input, comps), [input, comps]);
  const { state, submit, fieldError } = useLeadSubmit();
  const set = (p: Partial<EstimateInput>) => setInput((s) => ({ ...s, ...p }));

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void submit({
      kind: "owner",
      ...input,
      readiness: readiness || undefined,
      wantsManagement: management,
      name: f.get("name"),
      email: f.get("email"),
      phone: f.get("phone") || undefined,
      message: f.get("message") || undefined,
      website: f.get("website") || undefined,
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      {/* Inputs */}
      <div className="tile grid content-start gap-5 p-5 lg:col-span-7">
        <h2 className="text-lg font-semibold tracking-[-0.02em]">Your flat</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="o-district" label="District">
            <Select value={input.district} onValueChange={(v) => set({ district: v })}>
              <SelectTrigger id="o-district"><SelectValue /></SelectTrigger>
              <SelectContent>
                {DISTRICTS.map((d) => <SelectItem key={d} value={d}>District {d}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field id="o-cond" label="Condition">
            <Select value={input.condition} onValueChange={(v) => set({ condition: v as EstimateInput["condition"] })}>
              <SelectTrigger id="o-cond"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New build</SelectItem>
                <SelectItem value="renovated">Renovated</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="dated">Needs work</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid gap-3">
          <div className="flex items-baseline justify-between">
            <label htmlFor="o-size" className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Size</label>
            <span className="num text-sm font-medium">{input.sizeM2} m²</span>
          </div>
          <Slider id="o-size" min={20} max={200} step={1} value={[input.sizeM2]} onValueChange={([v]) => set({ sizeM2: v })} thumbLabel="Size in square metres" />
        </div>
        <Field id="o-furn" label="Furnishing">
          <Select value={input.furnished} onValueChange={(v) => set({ furnished: v as EstimateInput["furnished"] })}>
            <SelectTrigger id="o-furn"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="furnished">Furnished</SelectItem>
              <SelectItem value="partly">Part furnished</SelectItem>
              <SelectItem value="unfurnished">Unfurnished</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <div className="flex flex-wrap gap-6 text-sm text-muted">
          <label htmlFor="o-lift" className="flex items-center gap-3"><Switch id="o-lift" checked={input.elevator} onCheckedChange={(c) => set({ elevator: c })} /> Lift</label>
          <label htmlFor="o-balc" className="flex items-center gap-3"><Switch id="o-balc" checked={input.balcony} onCheckedChange={(c) => set({ balcony: c })} /> Balcony</label>
        </div>
      </div>

      {/* Result */}
      <div className="tile flex flex-col justify-between gap-6 p-5 lg:col-span-5" aria-live="polite">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Estimated monthly rent</p>
          <p className="display num mt-4 text-7xl text-accent md:text-8xl" data-testid="estimate-mid">{formatHuf(est.mid)}</p>
          <p className="num mt-1 text-sm text-muted">{formatEurApprox(est.mid)} · range {formatHuf(est.low)} to {formatHuf(est.high)}</p>
        </div>
        <div className="space-y-2 border-t border-border pt-4 text-xs text-muted-2">
          <p className="num">
            Based on {est.comparables} flats we&apos;re letting right now
            {est.basis === "district" ? ` in District ${input.district}` : est.basis === "zone" ? " in comparable districts" : " across Budapest"}, at about {formatHuf(est.perM2)} per m² for a flat like yours.
          </p>
          <p>A starting point, not a valuation. Monika confirms the asking rent after seeing the flat.</p>
        </div>
      </div>

      {/* Lead capture */}
      <div className="tile p-5 lg:col-span-12" id="owner-contact">
        <AnimatePresence mode="wait" initial={false}>
          {state.status === "done" ? (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 py-8 text-center" role="status">
              <KeyRound className="size-8 text-accent" />
              <p className="text-lg font-medium">Got it. Expect a call about your District {input.district} flat.</p>
              <p className="max-w-md text-sm text-muted">We&apos;ll confirm the asking rent, what to fix before photos, and how fast similar flats have let.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0 }} className="relative grid gap-4 md:grid-cols-12" aria-label="Get a call-back about letting your flat">
              <div className="md:col-span-12">
                <h2 className="text-lg font-semibold tracking-[-0.02em]">Want the real number? Let Monika see it.</h2>
                <p className="text-sm text-muted">A free call-back, a confirmed asking rent and a plan to get it let. No obligation.</p>
              </div>
              <Honeypot />
              <div className="md:col-span-4"><Field id="o-name" label="Name" error={fieldError("name")}><Input id="o-name" name="name" autoComplete="name" aria-invalid={!!fieldError("name")} /></Field></div>
              <div className="md:col-span-4"><Field id="o-email" label="Email" error={fieldError("email")}><Input id="o-email" name="email" type="email" autoComplete="email" aria-invalid={!!fieldError("email")} /></Field></div>
              <div className="md:col-span-4"><Field id="o-phone" label="Phone" error={fieldError("phone")}><Input id="o-phone" name="phone" type="tel" autoComplete="tel" placeholder="+36 …" aria-invalid={!!fieldError("phone")} /></Field></div>
              <div className="md:col-span-4">
                <Field id="o-ready" label="When is it free?" error={fieldError("readiness")}>
                  <Select value={readiness} onValueChange={setReadiness}>
                    <SelectTrigger id="o-ready" aria-invalid={!!fieldError("readiness")}><SelectValue placeholder="Pick one" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">It&apos;s empty now</SelectItem>
                      <SelectItem value="soon">Within 3 months</SelectItem>
                      <SelectItem value="exploring">Just exploring</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <label htmlFor="o-mgmt" className="flex items-center gap-3 self-end pb-2.5 text-sm text-muted md:col-span-4">
                <Switch id="o-mgmt" checked={management} onCheckedChange={setManagement} /> Manage it for me after letting
              </label>
              <div className="self-end md:col-span-4">
                {state.status === "error" && <p className="mb-2 text-sm text-danger" role="alert">{state.message}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={state.status === "sending"}>
                  {state.status === "sending" ? "Sending…" : "Get my call-back"}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
