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
      <div className="flex items-center gap-3 border border-emerald-500/40 bg-emerald-500/5 px-5 py-4">
        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
        <div>
          <p className="text-sm font-semibold text-emerald-300">
            Application submitted
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            The recruiter will review your profile and CV.
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
      className="inline-flex items-center gap-2 border border-white bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Send className="h-4 w-4" />
      )}
      {pending ? "Submitting..." : "Apply Now"}
    </button>
  );
}
