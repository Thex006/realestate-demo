"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Key } from "@phosphor-icons/react/ssr";
import { estimateValue, type ValuationInput } from "@/lib/estimate";
import { formatEur, formatEurShort } from "@/lib/format";
import type { Listing } from "@/lib/types";
import { AnimatedNumber } from "@/components/fx/animated-number";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Field, Honeypot } from "./field";
import { useLeadSubmit } from "./use-lead-submit";

type Comp = Pick<Listing, "kind" | "district" | "sizeM2" | "priceEur" | "view">;
const DISTRICTS = ["I", "II", "III", "V", "VI", "VII", "VIII", "IX", "XI", "XII", "XIII", "XIV"];

/** Live estimate from the agency's own listings; contact details turn it into a valuation request. */
export function ValuationForm({ comps }: { comps: Comp[] }) {
  const [input, setInput] = useState<ValuationInput>({ kind: "rent", district: "V", sizeM2: 110, bedrooms: 2, view: "standard", condition: "renovated" });
  const [readiness, setReadiness] = useState("");
  const [management, setManagement] = useState(true);
  const est = useMemo(() => estimateValue(input, comps), [input, comps]);
  const { state, submit, fieldError } = useLeadSubmit();
  const set = (p: Partial<ValuationInput>) => setInput((s) => ({ ...s, ...p }));
  const rent = input.kind === "rent";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    void submit({
      kind: "valuation",
      goal: input.kind,
      district: input.district,
      sizeM2: input.sizeM2,
      bedrooms: input.bedrooms,
      view: input.view,
      condition: input.condition,
      readiness: readiness || undefined,
      wantsManagement: rent && management,
      name: f.get("name"),
      email: f.get("email"),
      phone: f.get("phone") || undefined,
      message: f.get("message") || undefined,
      website: f.get("website") || undefined,
    });
  }

  return (
    <div className="grid gap-3 lg:grid-cols-12">
      <div className="tile grid content-start gap-6 p-6 lg:col-span-7">
        <div className="inline-flex w-fit rounded-full border border-border-strong p-1" role="radiogroup" aria-label="I want to">
          {(["rent", "sale"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={input.kind === k}
              onClick={() => set({ kind: k })}
              className={cn("relative rounded-full px-4 py-2 caption-5 transition-colors", input.kind === k ? "text-accent-ink" : "text-muted hover:text-foreground")}
            >
              {input.kind === k && <motion.span layoutId="goal-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="relative">{k === "rent" ? "Let it" : "Sell it"}</span>
            </button>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="o-district" label="District">
            <Select value={input.district} onValueChange={(v) => set({ district: v })}>
              <SelectTrigger id="o-district"><SelectValue /></SelectTrigger>
              <SelectContent>{DISTRICTS.map((d) => <SelectItem key={d} value={d}>District {d}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field id="o-cond" label="Condition">
            <Select value={input.condition} onValueChange={(v) => set({ condition: v as ValuationInput["condition"] })}>
              <SelectTrigger id="o-cond"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="new">New build</SelectItem>
                <SelectItem value="renovated">Renovated</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="dated">Needs work</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field id="o-beds" label="Bedrooms">
            <Select value={String(input.bedrooms)} onValueChange={(v) => set({ bedrooms: Number(v) })}>
              <SelectTrigger id="o-beds"><SelectValue /></SelectTrigger>
              <SelectContent>{[0, 1, 2, 3, 4, 5, 6].map((n) => <SelectItem key={n} value={String(n)}>{n === 0 ? "Studio" : `${n} bedroom${n > 1 ? "s" : ""}`}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field id="o-view" label="View">
            <Select value={input.view} onValueChange={(v) => set({ view: v as ValuationInput["view"] })}>
              <SelectTrigger id="o-view"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="premium">Danube, panorama or hills</SelectItem>
                <SelectItem value="standard">Street, courtyard or garden</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>
        <div className="grid gap-3">
          <div className="flex items-baseline justify-between">
            <label htmlFor="o-size" className="caption-4 uppercase tracking-[0.08em] text-muted">Size</label>
            <span className="num body-5">{input.sizeM2} m²</span>
          </div>
          <Slider id="o-size" min={25} max={500} step={5} value={[input.sizeM2]} onValueChange={([v]) => set({ sizeM2: v })} thumbLabel="Size in square metres" />
        </div>
      </div>

      <div className="tile spot flex flex-col justify-between gap-8 p-6 lg:col-span-5" aria-live="polite">
        <div>
          <p className="eyebrow">{rent ? "Estimated monthly rent" : "Estimated sale price"}</p>
          <p className="heading-1 num mt-6 text-accent">
            <AnimatedNumber value={est.mid} format={(n) => (rent ? formatEur(Math.round(n / 10) * 10) : formatEurShort(n))} testId="estimate-mid" />
          </p>
          <p className="num mt-2 body-6 text-muted">Range {rent ? formatEur(est.low) : formatEurShort(est.low)} to {rent ? formatEur(est.high) : formatEurShort(est.high)}</p>
        </div>
        <div className="space-y-2 border-t border-border pt-4 caption-5 text-muted-2">
          <p className="num">
            Based on {est.comparables} {rent ? "rentals" : "homes for sale"} on the agency&apos;s books
            {est.basis === "district" ? ` in District ${input.district}` : est.basis === "zone" ? "on the same side of the river" : "across Budapest"}, about {formatEur(est.perM2)} per m² for a home like yours.
          </p>
          <p>A starting point, not a valuation. The team confirms the figure after seeing the home.</p>
        </div>
      </div>

      <div className="tile p-6 lg:col-span-12">
        <AnimatePresence mode="wait" initial={false}>
          {state.status === "done" ? (
            <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3 py-8 text-center" role="status">
              <Key className="size-8 text-accent" />
              <p className="heading-3">Thank you. Expect a call about your District {input.district} home.</p>
              <p className="max-w-md body-6 text-muted">The team will confirm the figure, what to fix before the photographer comes, and how they would market it.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={onSubmit} noValidate exit={{ opacity: 0 }} className="relative grid gap-4 md:grid-cols-12" aria-label="Request a free valuation">
              <div className="md:col-span-12">
                <h2 className="heading-3">Want the real number?</h2>
                <p className="mt-1 body-6 text-muted">A free, no-obligation valuation and a marketing plan from the people who would {rent ? "let" : "sell"} it.</p>
              </div>
              <Honeypot />
              <div className="md:col-span-4"><Field id="o-name" label="Name" error={fieldError("name")}><Input id="o-name" name="name" autoComplete="name" aria-invalid={!!fieldError("name")} /></Field></div>
              <div className="md:col-span-4"><Field id="o-email" label="Email" error={fieldError("email")}><Input id="o-email" name="email" type="email" autoComplete="email" aria-invalid={!!fieldError("email")} /></Field></div>
              <div className="md:col-span-4"><Field id="o-phone" label="Phone" error={fieldError("phone")}><Input id="o-phone" name="phone" type="tel" autoComplete="tel" placeholder="+36 …" aria-invalid={!!fieldError("phone")} /></Field></div>
              <div className="md:col-span-4">
                <Field id="o-ready" label="When is it available?" error={fieldError("readiness")}>
                  <Select value={readiness} onValueChange={setReadiness}>
                    <SelectTrigger id="o-ready" aria-invalid={!!fieldError("readiness")}><SelectValue placeholder="Pick one" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="now">Now</SelectItem>
                      <SelectItem value="soon">Within 3 months</SelectItem>
                      <SelectItem value="exploring">Just exploring</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="flex items-end pb-2 md:col-span-4">
                {rent && (
                  <label htmlFor="o-mgmt" className="flex items-center gap-3 body-6 text-muted">
                    <Switch id="o-mgmt" checked={management} onCheckedChange={setManagement} /> Manage it for me after letting
                  </label>
                )}
              </div>
              <div className="self-end md:col-span-4">
                {state.status === "error" && <p className="mb-2 body-6 text-danger" role="alert">{state.message}</p>}
                <Button type="submit" size="lg" className="w-full" disabled={state.status === "sending"}>
                  {state.status === "sending" ? "Sending…" : "Get my free valuation"}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
