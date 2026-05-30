"use client";

import { useTransition, useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

interface ApplyButtonProps {
  action: () => Promise<void>;
}

export default function ApplyButton({ action }: ApplyButtonProps) {
  const [pending, startTransition] = useTransition();
  const [applied, setApplied] = useState(false);

  if (applied) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] px-4 py-4">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        <div>
          <p className="text-sm font-semibold text-emerald-300">Application submitted</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            The recruiter will review your profile and resume.
          </p>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() =>
        startTransition(async () => {
          await action();
          setApplied(true);
        })
      }
      disabled={pending}
      className="inline-flex w-full items-center justify-center gap-2.5 rounded-xl border border-white/90 bg-white px-6 py-3.5 text-sm font-semibold tracking-wide text-black shadow-sm transition-all hover:bg-zinc-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      {pending ? "Submitting…" : "Apply Now"}
    </button>
  );
}
