"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field, Honeypot } from "./field";
import { useLeadSubmit } from "./use-lead-submit";

export function ViewingForm({ listingId, street, agentName, petsAllowed }: { listingId: string; street: string; agentName: string; petsAllowed: boolean | null }) {
  const { state, submit, fieldError } = useLeadSubmit();
  const [moveIn, setMoveIn] = useState<string>("");
  const [lease, setLease] = useState("12");
  const [pets, setPets] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const budget = String(f.get("budget") ?? "").replace(/\D/g, "");
    void submit({
      kind: "viewing",
      listingId,
      name: f.get("name"),
      email: f.get("email"),
      phone: f.get("phone") || undefined,
      moveIn: moveIn || undefined,
      leaseMonths: Number(lease),
      occupants: Number(f.get("occupants") || 1),
      pets,
      budgetHuf: budget ? Number(budget) : undefined,
      message: f.get("message") || undefined,
      website: f.get("website") || undefined,
    });
  }

  return (
    <div className="tile p-5" id="viewing">
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "done" ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3 py-6 text-center" role="status">
            <CalendarCheck className="mx-auto size-8 text-accent" />
            <p className="text-lg font-medium">Request received for {street}.</p>
            <p className="text-sm text-muted">{agentName} will call you to fix a viewing time.</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} noValidate className="relative grid gap-4" exit={{ opacity: 0 }} aria-label="Request a viewing">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">Book a viewing</h2>
              <p className="text-sm text-muted">Free for tenants. No portal, no call centre: {agentName} calls you back personally.</p>
            </div>
            <Honeypot />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="v-name" label="Name" error={fieldError("name")}>
                <Input id="v-name" name="name" autoComplete="name" aria-invalid={!!fieldError("name")} required />
              </Field>
              <Field id="v-email" label="Email" error={fieldError("email")}>
                <Input id="v-email" name="email" type="email" autoComplete="email" aria-invalid={!!fieldError("email")} required />
              </Field>
              <Field id="v-phone" label="Phone" error={fieldError("phone")} hint="Fastest way to get a slot">
                <Input id="v-phone" name="phone" type="tel" autoComplete="tel" placeholder="+36 …" aria-invalid={!!fieldError("phone")} />
              </Field>
              <Field id="v-move" label="Move in" error={fieldError("moveIn")}>
                <Select value={moveIn} onValueChange={setMoveIn}>
                  <SelectTrigger id="v-move" aria-invalid={!!fieldError("moveIn")}><SelectValue placeholder="When?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">As soon as possible</SelectItem>
                    <SelectItem value="1m">Within a month</SelectItem>
                    <SelectItem value="3m">In 1 to 3 months</SelectItem>
                    <SelectItem value="later">Later than that</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="v-lease" label="Lease" error={fieldError("leaseMonths")}>
                <Select value={lease} onValueChange={setLease}>
                  <SelectTrigger id="v-lease"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months +</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field id="v-occ" label="People moving in" error={fieldError("occupants")}>
                <Input id="v-occ" name="occupants" type="number" inputMode="numeric" min={1} max={8} defaultValue={1} />
              </Field>
              <Field id="v-budget" label="Monthly budget (Ft)" hint="Optional. Helps us suggest alternatives." error={fieldError("budgetHuf")}>
                <Input id="v-budget" name="budget" inputMode="numeric" placeholder="e.g. 300000" />
              </Field>
              <div className="grid gap-1.5">
                <span className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Pets</span>
                <label htmlFor="v-pets" className="flex h-11 items-center gap-3 text-sm text-muted">
                  <Switch id="v-pets" checked={pets} onCheckedChange={setPets} />
                  {pets ? "Yes, I have a pet" : "No pets"}
                </label>
                {pets && petsAllowed === false && <p className="text-xs text-danger">The owner has asked for no pets here. We&apos;ll suggest pet-friendly flats too.</p>}
              </div>
            </div>
            <Field id="v-msg" label="Anything else" error={fieldError("message")}>
              <textarea id="v-msg" name="message" rows={3} maxLength={1000} className="w-full rounded-lg border border-border bg-card-2 px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-accent/60" placeholder="Best times to view, who's moving, questions…" />
            </Field>
            {state.status === "error" && <p className="text-sm text-danger" role="alert">{state.message}</p>}
            <Button type="submit" size="lg" disabled={state.status === "sending"}>
              {state.status === "sending" ? "Sending…" : "Request a viewing"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
