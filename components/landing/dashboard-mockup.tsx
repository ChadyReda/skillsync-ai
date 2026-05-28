"use client";

import { Bot, FileText, Map, Briefcase, Zap, MessageCircle } from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", active: false },
  { label: "Sync Feed",  active: false },
  { label: "AI Assistant", active: true },
  { label: "Resume",    active: false },
  { label: "Roadmaps",  active: false },
  { label: "Jobs",      active: false },
  { label: "Messages",  active: false },
];

const CARDS = [
  { icon: Bot,         label: "AI Career",  sub: "Ask me anything" },
  { icon: FileText,    label: "Resume",     sub: "Score: 87 / 100" },
  { icon: Map,         label: "Roadmaps",   sub: "3 in progress" },
  { icon: Briefcase,   label: "Jobs",       sub: "12 new matches" },
  { icon: Zap,         label: "Sync Feed",  sub: "24 syncs today" },
  { icon: MessageCircle, label: "Messages", sub: "2 unread" },
];

export function DashboardMockup() {
  return (
    <div className="relative w-full select-none float-anim" aria-hidden>
      {/* Ambient glow underneath */}
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-full opacity-20 blur-3xl bg-gradient-to-tr from-emerald-400/30 via-zinc-500/10 to-transparent dark:from-emerald-400/20" />

      {/* Browser chrome */}
      <div className="overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/50">

        {/* Title bar */}
        <div className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
          {/* macOS traffic lights */}
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-[#e0443e]/40" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-[#d49a1a]/40" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-[#1aaa30]/40" />
          </div>

          {/* URL bar */}
          <div className="flex flex-1 items-center gap-1.5 border border-zinc-800 bg-black/40 px-2.5 py-1 text-[10px] text-zinc-500">
            <svg viewBox="0 0 12 12" fill="none" className="h-2.5 w-2.5 shrink-0 text-zinc-600" aria-hidden>
              <path d="M6 1a5 5 0 1 0 0 10A5 5 0 0 0 6 1zM4 6a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
            </svg>
            <span className="truncate tracking-tight">skillsync.ai/dashboard</span>
          </div>
        </div>

        {/* App shell */}
        <div className="flex h-[340px] overflow-hidden">

          {/* Sidebar */}
          <div className="flex w-[140px] shrink-0 flex-col border-r border-zinc-800 bg-black">
            {/* Logo row */}
            <div className="flex items-center gap-1.5 border-b border-zinc-800 px-3 py-3">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-950">
                <span className="h-2 w-2 bg-white" />
              </div>
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-white">
                SkillSync
              </span>
            </div>

            {/* Role badge */}
            <div className="border-b border-zinc-800 px-3 py-2">
              <span className="inline-flex items-center gap-1 font-mono text-[8px] uppercase tracking-[0.18em] text-zinc-500">
                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                Candidate
              </span>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-hidden px-1.5 py-2">
              <p className="mb-1 px-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-700">
                Workspace
              </p>
              {NAV_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className={[
                    "flex items-center gap-1.5 border-l-2 px-2 py-1 text-[9px] transition-colors",
                    item.active
                      ? "border-l-white bg-zinc-900 text-white"
                      : "border-l-transparent text-zinc-600",
                  ].join(" ")}
                >
                  <span className="h-1.5 w-1.5 shrink-0 rounded-none border border-current opacity-60" />
                  <span className="truncate">{item.label}</span>
                </div>
              ))}
            </nav>

            {/* User row */}
            <div className="flex items-center gap-2 border-t border-zinc-800 px-3 py-2.5">
              <div className="h-5 w-5 shrink-0 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 ring-1 ring-zinc-700" />
              <div className="min-w-0">
                <p className="truncate font-mono text-[8px] text-zinc-300">Alex M.</p>
                <p className="font-mono text-[7px] text-zinc-600">Level 3 · 240 XP</p>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 overflow-hidden bg-black/30 p-4">
            {/* Welcome banner */}
            <div className="mb-4 border border-zinc-800 bg-zinc-950/80 px-4 py-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500 font-mono">
                    Welcome back
                  </p>
                  <p className="mt-0.5 text-xs font-semibold text-white">
                    Alex Morrison
                  </p>
                </div>
                <span className="shrink-0 border border-zinc-800 bg-black px-2 py-0.5 font-mono text-[8px] uppercase tracking-widest text-zinc-400">
                  Lv. 3
                </span>
              </div>
              {/* XP bar */}
              <div className="mt-2.5">
                <div className="flex justify-between font-mono text-[8px] text-zinc-600 mb-1">
                  <span>240 XP</span>
                  <span>500 XP</span>
                </div>
                <div className="h-1 w-full bg-zinc-800">
                  <div className="h-full w-[48%] bg-emerald-400 transition-all" />
                </div>
              </div>
            </div>

            {/* Feature grid */}
            <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.2em] text-zinc-600">
              Workspace
            </p>
            <div className="grid grid-cols-3 gap-px border border-zinc-800 bg-zinc-800">
              {CARDS.map(({ icon: Icon, label, sub }) => (
                <div
                  key={label}
                  className="group flex flex-col gap-1 bg-zinc-950 p-2.5 transition-colors hover:bg-zinc-900"
                >
                  <div className="flex h-5 w-5 items-center justify-center border border-zinc-800 bg-black group-hover:border-zinc-700">
                    <Icon className="h-2.5 w-2.5 text-zinc-400" />
                  </div>
                  <p className="text-[9px] font-medium text-white">{label}</p>
                  <p className="font-mono text-[7px] text-zinc-600">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
