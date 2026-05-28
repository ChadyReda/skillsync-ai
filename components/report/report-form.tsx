"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Send,
} from "lucide-react";

import { LIMITS } from "@/lib/report/validation";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; url: string; number: number }
  | { kind: "error"; message: string };

type FormState = {
  email: string;
  title: string;
  description: string;
  steps: string;
  environment: string;
};

const INITIAL: FormState = {
  email: "",
  title: "",
  description: "",
  steps: "",
  environment: "",
};

const inputClass =
  "w-full rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 backdrop-blur-sm transition-colors focus:border-zinc-600/60 focus:outline-none";

export function ReportForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, true>>>({});

  const emailId = useId();
  const titleId = useId();
  const descId = useId();
  const stepsId = useId();
  const envId = useId();

  const errors = validate(form);
  const hasErrors = Object.keys(errors).length > 0;
  const isSubmitting = status.kind === "submitting";

  useEffect(() => {
    if (status.kind !== "error") return;
    const t = setTimeout(() => setStatus({ kind: "idle" }), 6000);
    return () => clearTimeout(t);
  }, [status]);

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
    };

  const blur = (key: keyof FormState) => () =>
    setTouched((prev) => ({ ...prev, [key]: true }));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched({ email: true, title: true, description: true, steps: true, environment: true });
    if (hasErrors) return;

    setStatus({ kind: "submitting" });

    try {
      const res = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          title: form.title,
          description: form.description,
          steps: form.steps || undefined,
          environment: form.environment || undefined,
          url: typeof window !== "undefined" ? window.location.href : undefined,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
        issue?: { number: number; url: string };
      } | null;

      if (!res.ok || !data?.ok || !data.issue) {
        setStatus({
          kind: "error",
          message: data?.error ?? "We couldn't submit your report. Please try again.",
        });
        return;
      }

      setStatus({ kind: "success", url: data.issue.url, number: data.issue.number });
      setForm(INITIAL);
      setTouched({});
    } catch {
      setStatus({ kind: "error", message: "Network error. Check your connection and try again." });
    }
  }

  if (status.kind === "success") {
    return <SuccessCard url={status.url} number={status.number} onReset={() => setStatus({ kind: "idle" })} />;
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
    >
      <div className="space-y-5 p-6 sm:p-8">
        <Field
          id={emailId}
          label="Email"
          required
          hint="So we can follow up if we need more info."
          error={touched.email ? errors.email : undefined}
        >
          <input
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            maxLength={LIMITS.email}
            value={form.email}
            onChange={update("email")}
            onBlur={blur("email")}
            placeholder="you@example.com"
            className={inputClass}
          />
        </Field>

        <Field
          id={titleId}
          label="Issue title"
          required
          hint="A short summary of the bug."
          error={touched.title ? errors.title : undefined}
          counter={{ value: form.title.length, max: LIMITS.title }}
        >
          <input
            id={titleId}
            type="text"
            required
            maxLength={LIMITS.title}
            value={form.title}
            onChange={update("title")}
            onBlur={blur("title")}
            placeholder="e.g. Roadmap quiz crashes on submit"
            className={inputClass}
          />
        </Field>

        <Field
          id={descId}
          label="Description"
          required
          hint="What happened? What did you expect to happen?"
          error={touched.description ? errors.description : undefined}
          counter={{ value: form.description.length, max: LIMITS.description }}
        >
          <textarea
            id={descId}
            required
            rows={5}
            maxLength={LIMITS.description}
            value={form.description}
            onChange={update("description")}
            onBlur={blur("description")}
            placeholder="Describe the issue in detail..."
            className={`${inputClass} resize-y`}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id={stepsId}
            label="Reproduction steps"
            optional
            hint="1) ... 2) ... 3) ..."
            counter={{ value: form.steps.length, max: LIMITS.steps }}
          >
            <textarea
              id={stepsId}
              rows={4}
              maxLength={LIMITS.steps}
              value={form.steps}
              onChange={update("steps")}
              onBlur={blur("steps")}
              placeholder={"1. Go to /dashboard\n2. Click...\n3. See error..."}
              className={`${inputClass} resize-y`}
            />
          </Field>

          <Field
            id={envId}
            label="Browser / device"
            optional
            hint="e.g. Chrome 124 on macOS, Safari on iPhone 14"
            counter={{ value: form.environment.length, max: LIMITS.environment }}
          >
            <input
              id={envId}
              type="text"
              maxLength={LIMITS.environment}
              value={form.environment}
              onChange={update("environment")}
              onBlur={blur("environment")}
              placeholder="Browser, OS, device..."
              className={inputClass}
            />
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 border-t border-zinc-800/60 bg-zinc-900/20 px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
          Submits a public issue on GitHub
        </p>
        <button
          type="submit"
          disabled={isSubmitting || hasErrors}
          aria-disabled={isSubmitting || hasErrors}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:border-zinc-800/60 disabled:bg-zinc-900/60 disabled:text-zinc-600"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit report
            </>
          )}
        </button>
      </div>

      {/* Error banner */}
      {status.kind === "error" && (
        <div
          role="alert"
          className="flex items-start gap-3 border-t border-rose-500/20 bg-rose-500/[0.06] px-6 py-4 text-sm text-rose-300 sm:px-8"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{status.message}</p>
        </div>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  counter,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  counter?: { value: number; max: number };
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400"
        >
          {label}
          {required && <span className="ml-1 text-zinc-600">*</span>}
          {optional && <span className="ml-1 text-zinc-700">(optional)</span>}
        </label>
        {counter && (
          <span className="font-mono text-[10px] tabular-nums text-zinc-700">
            {counter.value}/{counter.max}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs text-rose-400">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-zinc-600">{hint}</p>
      ) : null}
    </div>
  );
}

function SuccessCard({
  url,
  number,
  onReset,
}: {
  url: string;
  number: number;
  onReset: () => void;
}) {
  return (
    <div
      role="status"
      className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-8 backdrop-blur-sm"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10">
        <CheckCircle2 className="h-6 w-6 text-emerald-400" />
      </div>

      <h2 className="mt-5 text-2xl font-bold text-white">Report submitted</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-400">
        Thank you. We opened issue{" "}
        <span className="font-mono text-zinc-200">#{number}</span> on GitHub —
        the team will take a look soon.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700/60 bg-zinc-900/60 px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:border-zinc-500 hover:bg-zinc-900"
        >
          View on GitHub
          <ExternalLink className="h-4 w-4" />
        </a>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-white bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100"
        >
          Submit another
        </button>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-zinc-500 transition-colors hover:text-white"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

function validate(form: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  const email = form.email.trim();
  const title = form.title.trim();
  const description = form.description.trim();

  if (!email) errors.email = "Email is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Please enter a valid email.";

  if (!title) errors.title = "Title is required.";
  else if (title.length < 4) errors.title = "Title must be at least 4 characters.";

  if (!description) errors.description = "Description is required.";
  else if (description.length < 10)
    errors.description = "Description must be at least 10 characters.";

  return errors;
}
