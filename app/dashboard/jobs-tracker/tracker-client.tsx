"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import {
  Bookmark,
  Send,
  CalendarClock,
  Trophy,
  XCircle,
  Building2,
  MapPin,
  Briefcase,
  ArrowRight,
  ChevronDown,
  X,
  KanbanSquare,
} from "lucide-react";
import { updateWatchlistStatus, removeFromWatchlist } from "./actions";

type Status = "watchlisted" | "applied" | "interviewing" | "offered" | "rejected";

type Job = {
  id: string;
  title: string;
  type: string;
  location: string | null;
  companyName: string | null;
  description: string;
  createdAt: Date | null;
};

type Entry = {
  id: string;
  jobId: string;
  status: string;
  notes: string | null;
  createdAt: Date | null;
  job: Job;
};

interface Props {
  entries: Entry[];
}

const COLUMNS: {
  id: Status;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string;
  dot: string;
}[] = [
  {
    id: "watchlisted",
    label: "Watchlisted",
    icon: Bookmark,
    accent: "border-blue-500/20 bg-blue-500/5",
    dot: "bg-blue-400",
  },
  {
    id: "applied",
    label: "Applied",
    icon: Send,
    accent: "border-violet-500/20 bg-violet-500/5",
    dot: "bg-violet-400",
  },
  {
    id: "interviewing",
    label: "Interviewing",
    icon: CalendarClock,
    accent: "border-amber-500/20 bg-amber-500/5",
    dot: "bg-amber-400",
  },
  {
    id: "offered",
    label: "Offered",
    icon: Trophy,
    accent: "border-emerald-500/20 bg-emerald-500/5",
    dot: "bg-emerald-400",
  },
  {
    id: "rejected",
    label: "Rejected",
    icon: XCircle,
    accent: "border-red-500/20 bg-red-500/5",
    dot: "bg-red-400",
  },
];

const TYPE_LABEL: Record<string, string> = {
  job: "Full-time",
  internship: "Internship",
};

function StatusDropdown({
  currentStatus,
  onMove,
  disabled,
}: {
  currentStatus: Status;
  onMove: (s: Status) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = COLUMNS.find((c) => c.id === currentStatus)!;
  const others = COLUMNS.filter((c) => c.id !== currentStatus);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="flex items-center gap-1.5 rounded-md border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200 disabled:opacity-50"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
        {current.label}
        <ChevronDown className="h-3 w-3 opacity-60" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 z-20 mb-1.5 min-w-[140px] overflow-hidden rounded-lg border border-zinc-800/60 bg-zinc-950 shadow-xl">
            {others.map((col) => (
              <button
                key={col.id}
                onClick={() => {
                  onMove(col.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[10px] uppercase tracking-wider text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-200"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${col.dot}`} />
                {col.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function KanbanCard({
  entry,
  onMove,
  onRemove,
}: {
  entry: Entry;
  onMove: (id: string, status: Status) => void;
  onRemove: (jobId: string) => void;
}) {
  const [movePending, startMove] = useTransition();
  const [removePending, startRemove] = useTransition();

  function handleMove(newStatus: Status) {
    onMove(entry.id, newStatus);
    startMove(async () => {
      await updateWatchlistStatus(entry.id, newStatus);
    });
  }

  function handleRemove() {
    onRemove(entry.jobId);
    startRemove(async () => {
      await removeFromWatchlist(entry.jobId);
    });
  }

  const typeLabel = TYPE_LABEL[entry.job.type] ?? entry.job.type;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="group relative rounded-lg border border-zinc-800/60 bg-zinc-950/80 p-4 backdrop-blur-sm transition-colors hover:border-zinc-700/60"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.025) inset" }}
    >
      <button
        onClick={handleRemove}
        disabled={removePending}
        className="absolute right-2.5 top-2.5 flex h-6 w-6 items-center justify-center rounded-md text-zinc-700 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/5 hover:text-zinc-400 disabled:opacity-30"
        title="Remove from tracker"
      >
        <X className="h-3 w-3" />
      </button>

      <div className="mb-3 flex items-start gap-3 pr-6">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/60">
          <Building2 className="h-3.5 w-3.5 text-zinc-500" />
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold leading-tight text-white">
            {entry.job.title}
          </h3>
          {entry.job.companyName && (
            <p className="mt-0.5 truncate text-xs text-zinc-500">{entry.job.companyName}</p>
          )}
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800/60 bg-zinc-900/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
          <Briefcase className="h-2.5 w-2.5" />
          {typeLabel}
        </span>
        {entry.job.location && (
          <span className="inline-flex items-center gap-1 rounded-md border border-zinc-800/60 bg-zinc-900/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
            <MapPin className="h-2.5 w-2.5" />
            {entry.job.location}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <StatusDropdown
          currentStatus={entry.status as Status}
          onMove={handleMove}
          disabled={movePending || removePending}
        />
        <Link
          href={`/dashboard/jobs/${entry.jobId}`}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-600 hover:text-zinc-300"
        >
          View
          <ArrowRight className="h-2.5 w-2.5" />
        </Link>
      </div>
    </motion.div>
  );
}

function KanbanColumn({
  col,
  entries,
  onMove,
  onRemove,
}: {
  col: (typeof COLUMNS)[number];
  entries: Entry[];
  onMove: (id: string, status: Status) => void;
  onRemove: (jobId: string) => void;
}) {
  const Icon = col.icon;

  return (
    <div className="flex w-72 shrink-0 flex-col gap-2">
      <div className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${col.accent}`}>
        <div className="flex items-center gap-2">
          <Icon className="h-3.5 w-3.5 text-zinc-400" />
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-300">
            {col.label}
          </span>
        </div>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-900/80 px-1.5 font-mono text-[9px] text-zinc-400">
          {entries.length}
        </span>
      </div>

      <div className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-800/40 p-2 min-h-[120px]">
        <AnimatePresence mode="popLayout">
          {entries.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-1 items-center justify-center py-8"
            >
              <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-700">
                No jobs
              </p>
            </motion.div>
          ) : (
            entries.map((entry) => (
              <KanbanCard
                key={entry.id}
                entry={entry}
                onMove={onMove}
                onRemove={onRemove}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function TrackerClient({ entries: initialEntries }: Props) {
  const [entries, setEntries] = useState(initialEntries);

  function handleMove(id: string, newStatus: Status) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e)),
    );
  }

  function handleRemove(jobId: string) {
    setEntries((prev) => prev.filter((e) => e.jobId !== jobId));
  }

  const total = entries.length;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-zinc-800/60 px-6 py-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          [ tracker ]
        </p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <KanbanSquare className="h-5 w-5" />
            Jobs Tracker
          </h1>
          {total > 0 && (
            <span className="rounded-full border border-zinc-700/50 bg-zinc-900/60 px-2.5 py-0.5 font-mono text-[10px] text-zinc-400">
              {total} job{total !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Track your job applications from first interest to offer.
        </p>
      </div>

      {total === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-20">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-900/60">
            <Bookmark className="h-7 w-7 text-zinc-600" />
          </div>
          <div className="text-center">
            <p className="font-medium text-zinc-300">No jobs tracked yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              Save jobs from the{" "}
              <Link href="/dashboard/jobs" className="text-zinc-400 underline underline-offset-2 hover:text-white">
                Jobs page
              </Link>{" "}
              to start tracking them here.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-4 p-6" style={{ minWidth: "max-content" }}>
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                col={col}
                entries={entries.filter((e) => e.status === col.id)}
                onMove={handleMove}
                onRemove={handleRemove}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
