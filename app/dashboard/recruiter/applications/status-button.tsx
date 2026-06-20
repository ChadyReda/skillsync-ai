"use client";

import { useTransition, useState } from "react";
import { updateApplicationStatus } from "./actions";
import { ChevronDown, Loader2 } from "lucide-react";

const STATUSES = [
  { value: "applied", label: "Applied", dot: "bg-zinc-400", cls: "text-zinc-300 border-zinc-700/50 bg-zinc-900/60" },
  { value: "reviewing", label: "Reviewing", dot: "bg-amber-400", cls: "text-amber-300 border-amber-500/30 bg-amber-500/[0.06]" },
  { value: "interview", label: "Interview", dot: "bg-sky-400", cls: "text-sky-300 border-sky-500/30 bg-sky-500/[0.06]" },
  { value: "offer", label: "Offer", dot: "bg-emerald-400", cls: "text-emerald-300 border-emerald-500/30 bg-emerald-500/[0.06]" },
  { value: "rejected", label: "Rejected", dot: "bg-rose-400", cls: "text-rose-300 border-rose-500/30 bg-rose-500/[0.06]" },
] as const;

type StatusValue = (typeof STATUSES)[number]["value"];

export function StatusButton({
  applicationId,
  initialStatus,
}: {
  applicationId: string;
  initialStatus: string;
}) {
  const [status, setStatus] = useState<StatusValue>(
    (STATUSES.find((s) => s.value === initialStatus)?.value ?? "applied") as StatusValue,
  );
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const current = STATUSES.find((s) => s.value === status) ?? STATUSES[0];

  const handleSelect = (next: StatusValue) => {
    setOpen(false);
    if (next === status) return;
    startTransition(async () => {
      await updateApplicationStatus(applicationId, next);
      setStatus(next);
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm transition-all",
          current.cls,
        ].join(" ")}
      >
        {pending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
        )}
        {current.label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1.5 min-w-[140px] overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950 shadow-2xl">
            {STATUSES.map((s) => (
              <button
                key={s.value}
                onClick={() => handleSelect(s.value)}
                className={[
                  "flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider transition-colors hover:bg-zinc-800/60",
                  s.value === status ? "text-white" : "text-zinc-400",
                ].join(" ")}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
