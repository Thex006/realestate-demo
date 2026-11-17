"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CalendarCheck } from "@phosphor-icons/react/ssr";
import type { Kind } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field, Honeypot } from "./field";
import { useLeadSubmit } from "./use-lead-submit";

/** Viewing request for one home. Four fields to send; the rest is optional and helps the agent prepare. */
export function ViewingForm({ listingId, kind, street, agentName }: { listingId: string; kind: Kind; street: string; agentName: string }) {
  const { state, submit, fieldError } = useLeadSubmit();
  const [timing, setTiming] = useState("");
  const [relocating, setRelocating] = useState(false);
  const rent = kind === "rent";

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
      timing: timing || undefined,
      budgetEur: budget ? Number(budget) : undefined,
      relocating,
      message: f.get("message") || undefined,
      website: f.get("website") || undefined,
    });
  }

  return (
    <div className="tile p-6" id="viewing">
      <AnimatePresence mode="wait" initial={false}>
        {state.status === "done" ? (
          <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-3 py-8 text-center" role="status">
            <CalendarCheck className="mx-auto size-8 text-accent" />
            <p className="heading-4">Request sent for {street}.</p>
            <p className="body-6 text-muted">{agentName} will call you to fix a time.</p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} noValidate className="relative grid gap-4" exit={{ opacity: 0 }} aria-label="Book a viewing">
            <div>
              <h2 className="heading-4">Book a viewing</h2>
              <p className="mt-1 body-6 text-muted">{rent ? "Free for tenants." : ""}{agentName} calls you back personally. No call centre in between.</p>
            </div>
            <Honeypot />
            <Field id="v-name" label="Name" error={fieldError("name")}>
              <Input id="v-name" name="name" autoComplete="name" aria-invalid={!!fieldError("name")} required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Field id="v-email" label="Email" error={fieldError("email")}>
                <Input id="v-email" name="email" type="email" autoComplete="email" aria-invalid={!!fieldError("email")} required />
              </Field>
              <Field id="v-phone" label="Phone" error={fieldError("phone")} hint="Fastest way to get a slot">
                <Input id="v-phone" name="phone" type="tel" autoComplete="tel" placeholder="+36 …" aria-invalid={!!fieldError("phone")} />
              </Field>
            </div>
            <Field id="v-timing" label={rent ? "When do you want to move?" : "When do you want to buy?"} error={fieldError("timing")}>
              <Select value={timing} onValueChange={setTiming}>
                <SelectTrigger id="v-timing" aria-invalid={!!fieldError("timing")}><SelectValue placeholder="Pick one" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="now">As soon as possible</SelectItem>
                  <SelectItem value="1m">Within a month</SelectItem>
                  <SelectItem value="3m">In 1 to 3 months</SelectItem>
                  <SelectItem value="browsing">Just looking for now</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field id="v-budget" label={rent ? "Monthly budget (€)" : "Budget (€)"} hint="Optional. Helps the agent line up alternatives." error={fieldError("budgetEur")}>
              <Input id="v-budget" name="budget" inputMode="numeric" placeholder={rent ? "e.g. 2500" : "e.g. 750000"} />
            </Field>
            <label htmlFor="v-reloc" className="flex items-center gap-3 body-6 text-muted">
              <Switch id="v-reloc" checked={relocating} onCheckedChange={setRelocating} /> I&apos;m relocating to Budapest
            </label>
            <Field id="v-msg" label="Anything else" error={fieldError("message")}>
              <textarea id="v-msg" name="message" rows={3} maxLength={1000} className="w-full rounded-md border border-border bg-card-2 px-3 py-2 body-6 placeholder:text-muted-2 focus-visible:border-accent/60" placeholder="Best times, who's moving, questions…" />
            </Field>
            {state.status === "error" && <p className="body-6 text-danger" role="alert">{state.message}</p>}
            <Button type="submit" size="lg" disabled={state.status === "sending"}>
              {state.status === "sending" ? "Sending…" : "Request a viewing"}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
