"use client";

import { useState } from "react";

export type SubmitState =
  | { status: "idle" }
  | { status: "sending" }
  | { status: "error"; message: string; fieldErrors?: Record<string, string> }
  | { status: "done"; data: Record<string, unknown> };

/** Shared POST /api/leads flow with field errors, honeypot and UTM capture. */
export function useLeadSubmit() {
  const [state, setState] = useState<SubmitState>({ status: "idle" });

  async function submit(payload: Record<string, unknown>) {
    setState({ status: "sending" });
    const utm = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...payload,
          utmSource: utm?.get("utm_source") ?? undefined,
          utmCampaign: utm?.get("utm_campaign") ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) return setState({ status: "done", data });
      setState({
        status: "error",
        message: data.error ?? (data.fieldErrors ? "Check the highlighted fields." : "Something went wrong. Please try again."),
        fieldErrors: data.fieldErrors,
      });
    } catch {
      setState({ status: "error", message: "You seem to be offline. Please try again." });
    }
  }

  const fieldError = (k: string) => (state.status === "error" ? state.fieldErrors?.[k] : undefined);
  return { state, submit, fieldError };
}
