"use client";

import { useEffect, useId, useRef, useState } from "react";
import { HONEYPOT_FIELD, type WaitlistRole, isWaitlistRole, waitlistRoles, waitlistSchema } from "@/lib/waitlist";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "error"; message: string; field?: "email" | "role" }
  | { kind: "done" };

/**
 * The waitlist form. Links elsewhere on the page can preselect a role with
 * `preselectRole(...)` (for example "Talk to us about a pilot").
 */
export function WaitlistForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WaitlistRole | "">("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const emailRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLSelectElement>(null);
  const doneRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const trigger = (event.target as Element | null)?.closest<HTMLElement>("[data-waitlist-role]");
      const value = trigger?.dataset.waitlistRole;
      if (isWaitlistRole(value)) setRole(value);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (status.kind === "done") doneRef.current?.focus();
    if (status.kind === "error" && status.field === "email") emailRef.current?.focus();
    if (status.kind === "error" && status.field === "role") roleRef.current?.focus();
  }, [status]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = waitlistSchema.safeParse({ email: email.trim(), role });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setStatus({
        kind: "error",
        message: issue?.message ?? "Check the form and try again.",
        field: issue?.path[0] === "role" ? "role" : "email",
      });
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...parsed.data, [HONEYPOT_FIELD]: honeypot }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus({ kind: "error", message: data?.error ?? "That didn’t go through. Try again." });
        return;
      }
      setStatus({ kind: "done" });
    } catch {
      setStatus({ kind: "error", message: "That didn’t go through. Check your connection and try again." });
    }
  }

  const error = status.kind === "error" ? status : null;
  const fieldClass =
    "h-12 w-full rounded-full border bg-surface px-5 text-[15px] text-ink transition-colors placeholder:text-ink-muted";
  const borderFor = (field: "email" | "role") =>
    error?.field === field ? "border-red-700" : "border-ink/50 hover:border-ink focus:border-ink";

  return (
    <div className="mx-auto w-full max-w-2xl">
      {status.kind === "done" ? (
        <div className="rounded-2xl bg-studio px-6 py-5 text-center">
          <p ref={doneRef} tabIndex={-1} className="text-lg font-semibold outline-none">
            You’re on the list.
          </p>
          <p className="mt-1 text-ink-muted">We’ll email {email.trim()} when early access opens.</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label htmlFor={`${id}-email`} className="sr-only">
              Email
            </label>
            <input
              ref={emailRef}
              id={`${id}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={error?.field === "email" || undefined}
              aria-describedby={`${id}-message`}
              className={`${fieldClass} sm:flex-[1.3] ${borderFor("email")}`}
            />
            <label htmlFor={`${id}-role`} className="sr-only">
              I am a
            </label>
            <select
              ref={roleRef}
              id={`${id}-role`}
              name="role"
              value={role}
              onChange={(event) => setRole(isWaitlistRole(event.target.value) ? event.target.value : "")}
              aria-invalid={error?.field === "role" || undefined}
              aria-describedby={`${id}-message`}
              className={`${fieldClass} select-arrow pr-11 sm:flex-1 ${role === "" ? "text-ink-muted" : ""} ${borderFor("role")}`}
            >
              <option value="" disabled>
                I am a…
              </option>
              {waitlistRoles.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {/* Spam trap: hidden from people and assistive technology. */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor={`${id}-${HONEYPOT_FIELD}`}>Leave this empty</label>
              <input
                id={`${id}-${HONEYPOT_FIELD}`}
                name={HONEYPOT_FIELD}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(event) => setHoneypot(event.target.value)}
              />
            </div>
            <button type="submit" className="button-primary shrink-0" disabled={status.kind === "sending"}>
              {status.kind === "sending" ? "Joining…" : "Join the waitlist"}
            </button>
          </div>
          <p id={`${id}-message`} className={`mt-3 min-h-6 text-center text-sm ${error ? "text-red-800" : "text-ink-muted"}`}>
            {error ? error.message : "We’ll only email you about MechLens."}
          </p>
        </form>
      )}
      {/* One persistent region, so screen readers announce each change. */}
      <p aria-live="polite" className="sr-only">
        {status.kind === "error" ? status.message : status.kind === "done" ? "You’re on the list." : ""}
      </p>
    </div>
  );
}
