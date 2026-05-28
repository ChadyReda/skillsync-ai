import {
  Bot,
  FileText,
  Map,
  Briefcase,
  Zap,
  MessageCircle,
  GitBranch,
  LayoutDashboard,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

const NAV = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: Zap,             label: "Sync Feed",  active: false },
  { icon: Bot,             label: "AI Assistant", active: false },
  { icon: FileText,        label: "Resume",    active: true  },
  { icon: Map,             label: "Roadmaps",  active: false },
  { icon: Briefcase,       label: "Jobs",      active: false },
  { icon: GitBranch,       label: "GitHub",    active: false },
  { icon: MessageCircle,   label: "Messages",  active: false },
];

const SKILLS = [
  { label: "React",      score: 92 },
  { label: "TypeScript", score: 88 },
  { label: "Node.js",    score: 75 },
  { label: "SQL",        score: 64 },
];

const JOBS = [
  { title: "Senior Frontend Engineer",  company: "Vercel",  match: 96, new: true  },
  { title: "Full-Stack Developer",       company: "Linear",  match: 91, new: true  },
  { title: "React Developer",           company: "Notion",  match: 87, new: false },
];

const SUGGESTIONS = [
  "Add a quantified achievement to your work history",
  "Your summary could be 30% shorter for recruiter scans",
  "Consider listing TypeScript before JavaScript",
];

export function ProductShowcase() {
  return (
    <section className="border-b border-zinc-800 bg-zinc-950 px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section label */}
        <div className="mb-12 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
            [ 01 ] the product
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Built for getting hired,<br className="hidden sm:block" /> not just applying
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-zinc-500">
            Every feature exists to move you closer to an offer — not to pad a dashboard.
          </p>
        </div>

        {/* Browser chrome */}
        <div className="overflow-hidden border border-zinc-800 shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)]">
          {/* Title bar */}
          <div className="flex items-center gap-3 border-b border-zinc-800 bg-[#0a0a0a] px-4 py-3">
            <div className="flex shrink-0 gap-1.5">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="flex flex-1 items-center gap-2 border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-[11px] text-zinc-500">
              <svg viewBox="0 0 12 16" fill="none" className="h-2.5 w-2.5 shrink-0" aria-hidden>
                <path d="M6 1C3.24 1 1 3.24 1 6s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm0 8.5A3.63 3.63 0 0 1 2.5 9.5a4.48 4.48 0 0 1 7 0A3.63 3.63 0 0 1 6 11.5z" fill="currentColor"/>
              </svg>
              <span className="truncate font-mono">skillsync.ai/dashboard/cv</span>
            </div>
          </div>

          {/* App shell */}
          <div className="flex bg-[#0d0d0f]" style={{ minHeight: 480 }}>

            {/* Sidebar */}
            <div className="hidden w-48 shrink-0 flex-col border-r border-zinc-800 bg-black sm:flex">
              {/* Logo */}
              <div className="flex h-14 items-center gap-2.5 border-b border-zinc-800 px-4">
                <div className="flex h-6 w-6 items-center justify-center border border-zinc-700 bg-zinc-900">
                  <span className="h-2.5 w-2.5 bg-white" />
                </div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                  SkillSync
                </span>
              </div>

              {/* Role */}
              <div className="border-b border-zinc-800 px-4 py-2">
                <span className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Candidate
                </span>
              </div>

              {/* Nav items */}
              <nav className="flex-1 space-y-px overflow-hidden px-2 py-3">
                <p className="mb-1.5 px-2 font-mono text-[8px] uppercase tracking-[0.22em] text-zinc-700">
                  Workspace
                </p>
                {NAV.map((item) => (
                  <div
                    key={item.label}
                    className={[
                      "flex items-center gap-2 border-l-2 px-2 py-1.5 text-[10px]",
                      item.active
                        ? "border-l-white bg-zinc-900 text-white"
                        : "border-l-transparent text-zinc-600",
                    ].join(" ")}
                  >
                    <item.icon className="h-3 w-3 shrink-0" />
                    <span>{item.label}</span>
                    {item.active && (
                      <span className="ml-auto font-mono text-[8px] text-zinc-600">live</span>
                    )}
                  </div>
                ))}
              </nav>

              {/* User */}
              <div className="flex items-center gap-2 border-t border-zinc-800 px-3 py-3">
                <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700" />
                <div className="min-w-0">
                  <p className="truncate font-mono text-[9px] text-zinc-300">Alex M.</p>
                  <p className="font-mono text-[8px] text-zinc-600">Lv 3 · 240 XP</p>
                </div>
              </div>
            </div>

            {/* Main — resume page */}
            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-hidden p-5">

              {/* Page header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-sm font-semibold text-white">Resume Intelligence</h1>
                  <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
                    AI analysis · Last updated 2h ago
                  </p>
                </div>
                <div className="hidden items-center gap-2 sm:flex">
                  <div className="border border-zinc-800 bg-zinc-900 px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-zinc-400 hover:bg-zinc-800">
                    Download PDF
                  </div>
                  <div className="border border-white bg-white px-3 py-1.5 font-mono text-[9px] uppercase tracking-widest text-black">
                    Update Resume
                  </div>
                </div>
              </div>

              {/* Score + skills row */}
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                {/* Overall score */}
                <div className="border border-zinc-800 bg-zinc-950 p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                    Overall Score
                  </p>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">87</span>
                    <span className="mb-1 text-lg text-zinc-600">/100</span>
                  </div>
                  <div className="mt-3 h-1 w-full bg-zinc-800">
                    <div className="h-full bg-emerald-400" style={{ width: "87%" }} />
                  </div>
                  <p className="mt-2 font-mono text-[9px] text-emerald-400">
                    ↑ +12 from last version
                  </p>
                </div>

                {/* Skill scores */}
                <div className="border border-zinc-800 bg-zinc-950 p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                    Top Skills Detected
                  </p>
                  <div className="mt-3 space-y-2">
                    {SKILLS.map((s) => (
                      <div key={s.label}>
                        <div className="flex justify-between font-mono text-[9px] text-zinc-400 mb-1">
                          <span>{s.label}</span>
                          <span>{s.score}%</span>
                        </div>
                        <div className="h-0.5 w-full bg-zinc-800">
                          <div
                            className="h-full bg-zinc-400"
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI suggestions */}
                <div className="border border-zinc-800 bg-zinc-950 p-4">
                  <div className="flex items-center gap-2">
                    <Bot className="h-3 w-3 text-zinc-500" />
                    <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                      AI Suggestions
                    </p>
                  </div>
                  <div className="mt-3 space-y-2">
                    {SUGGESTIONS.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <span className="mt-0.5 h-3 w-3 shrink-0 rounded-none border border-zinc-700 text-center font-mono text-[8px] leading-[10px] text-zinc-500">
                          {i + 1}
                        </span>
                        <p className="text-[10px] leading-relaxed text-zinc-400">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Job matches */}
              <div className="border border-zinc-800 bg-zinc-950">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-zinc-500" />
                    <p className="text-[11px] font-semibold text-white">
                      Matched Jobs
                    </p>
                    <span className="border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[8px] text-emerald-400">
                      3 new
                    </span>
                  </div>
                  <button className="flex items-center gap-1 font-mono text-[9px] text-zinc-500 hover:text-zinc-300">
                    View all 24
                    <ArrowRight className="h-2.5 w-2.5" />
                  </button>
                </div>
                <div className="divide-y divide-zinc-800/60">
                  {JOBS.map((job) => (
                    <div
                      key={job.title}
                      className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-zinc-900/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-zinc-800 bg-zinc-900 font-mono text-[9px] font-bold text-zinc-300">
                          {job.company[0]}
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-white">{job.title}</p>
                          <p className="font-mono text-[9px] text-zinc-500">{job.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {job.new && (
                          <span className="border border-zinc-700 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-wider text-zinc-500">
                            new
                          </span>
                        )}
                        <span
                          className={[
                            "border px-2 py-0.5 font-mono text-[9px] font-semibold",
                            job.match >= 90
                              ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-400"
                              : "border-zinc-700 bg-zinc-900 text-zinc-400",
                          ].join(" ")}
                        >
                          {job.match}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Caption */}
        <p className="mt-4 text-center font-mono text-[11px] text-zinc-600">
          Resume Intelligence — one of seven AI-powered tools inside SkillSync
        </p>
      </div>
    </section>
  );
}
