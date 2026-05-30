"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Zap,
  FileText,
  Map,
  Briefcase,
  MessageCircle,
  Search,
  Star,
  ClipboardList,
  User,
  ArrowRight,
  TrendingUp,
  GitBranch,
  Mail,
  KanbanSquare,
} from "lucide-react";
import type { ElementType } from "react";

function HiloSquareIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className={className}>
      <rect x="2" y="2" width="12" height="12" rx="1.5" />
    </svg>
  );
}

type AccentKey = "amber" | "violet" | "emerald" | "cyan" | "blue" | "lime" | "rose" | "orange" | "teal";

type Feature = {
  href: string;
  icon: ElementType;
  title: string;
  description: string;
  accent: AccentKey;
};

const ACCENTS: Record<AccentKey, {
  iconBorder: string;
  iconBg: string;
  iconColor: string;
  arrowColor: string;
  topHighlight: string;
  insetGlow: string;
}> = {
  amber:   { iconBorder: "group-hover:border-amber-500/30",   iconBg: "group-hover:bg-amber-500/[0.07]",   iconColor: "group-hover:text-amber-400",   arrowColor: "group-hover:text-amber-400",   topHighlight: "rgba(245,158,11,0.5), rgba(245,158,11,0.7)",   insetGlow: "rgba(245,158,11,0.07)" },
  violet:  { iconBorder: "group-hover:border-violet-500/30",  iconBg: "group-hover:bg-violet-500/[0.07]",  iconColor: "group-hover:text-violet-400",  arrowColor: "group-hover:text-violet-400",  topHighlight: "rgba(139,92,246,0.5), rgba(139,92,246,0.7)",   insetGlow: "rgba(139,92,246,0.07)" },
  emerald: { iconBorder: "group-hover:border-emerald-500/30", iconBg: "group-hover:bg-emerald-500/[0.07]", iconColor: "group-hover:text-emerald-400", arrowColor: "group-hover:text-emerald-400", topHighlight: "rgba(16,185,129,0.5), rgba(16,185,129,0.7)",   insetGlow: "rgba(16,185,129,0.07)" },
  cyan:    { iconBorder: "group-hover:border-cyan-500/30",    iconBg: "group-hover:bg-cyan-500/[0.07]",    iconColor: "group-hover:text-cyan-400",    arrowColor: "group-hover:text-cyan-400",    topHighlight: "rgba(6,182,212,0.5), rgba(6,182,212,0.7)",     insetGlow: "rgba(6,182,212,0.07)" },
  blue:    { iconBorder: "group-hover:border-blue-500/30",    iconBg: "group-hover:bg-blue-500/[0.07]",    iconColor: "group-hover:text-blue-400",    arrowColor: "group-hover:text-blue-400",    topHighlight: "rgba(59,130,246,0.5), rgba(59,130,246,0.7)",   insetGlow: "rgba(59,130,246,0.07)" },
  lime:    { iconBorder: "group-hover:border-lime-500/30",    iconBg: "group-hover:bg-lime-500/[0.07]",    iconColor: "group-hover:text-lime-400",    arrowColor: "group-hover:text-lime-400",    topHighlight: "rgba(132,204,22,0.5), rgba(132,204,22,0.7)",   insetGlow: "rgba(132,204,22,0.07)" },
  rose:    { iconBorder: "group-hover:border-rose-500/30",    iconBg: "group-hover:bg-rose-500/[0.07]",    iconColor: "group-hover:text-rose-400",    arrowColor: "group-hover:text-rose-400",    topHighlight: "rgba(244,63,94,0.5), rgba(244,63,94,0.7)",     insetGlow: "rgba(244,63,94,0.07)" },
  orange:  { iconBorder: "group-hover:border-orange-500/30",  iconBg: "group-hover:bg-orange-500/[0.07]",  iconColor: "group-hover:text-orange-400",  arrowColor: "group-hover:text-orange-400",  topHighlight: "rgba(249,115,22,0.5), rgba(249,115,22,0.7)",   insetGlow: "rgba(249,115,22,0.07)" },
  teal:    { iconBorder: "group-hover:border-teal-500/30",    iconBg: "group-hover:bg-teal-500/[0.07]",    iconColor: "group-hover:text-teal-400",    arrowColor: "group-hover:text-teal-400",    topHighlight: "rgba(20,184,166,0.5), rgba(20,184,166,0.7)",   insetGlow: "rgba(20,184,166,0.07)" },
};

const candidateFeatures: Feature[] = [
  { href: "/dashboard/feed",    icon: Zap,           title: "Sync Feed",     description: "Share updates, discover trending ideas",      accent: "amber" },
  { href: "/dashboard/ai",      icon: HiloSquareIcon,title: "AI Assistant",  description: "Chat with your personal career AI",           accent: "violet" },
  { href: "/dashboard/cv",      icon: FileText,       title: "Resume",        description: "Upload & get AI-powered insights",            accent: "emerald" },
  { href: "/dashboard/roadmaps",icon: Map,            title: "Roadmaps",      description: "AI-generated learning journeys",              accent: "cyan" },
  { href: "/dashboard/jobs",         icon: Briefcase,     title: "Jobs",          description: "Browse curated opportunities",                accent: "blue" },
  { href: "/dashboard/jobs-tracker", icon: KanbanSquare, title: "Jobs Tracker",  description: "Track applications on a Kanban board",        accent: "teal" },
  { href: "/dashboard/github",       icon: GitBranch,    title: "GitHub",        description: "Showcase your engineering analytics",        accent: "lime" },
  { href: "/dashboard/chat",    icon: MessageCircle,  title: "Messages",      description: "Connect with recruiters directly",            accent: "rose" },
];

const recruiterFeatures: Feature[] = [
  { href: "/dashboard/feed",                    icon: Zap,          title: "Sync Feed",     description: "Share updates, engage the community",          accent: "amber" },
  { href: "/dashboard/recruiter/search",        icon: Search,       title: "Find Talent",   description: "AI-powered candidate discovery",               accent: "violet" },
  { href: "/dashboard/recruiter/shortlist",     icon: Star,         title: "Shortlist",     description: "Your curated candidate list",                  accent: "orange" },
  { href: "/dashboard/recruiter/jobs",          icon: Briefcase,    title: "Manage Jobs",   description: "Post and manage your positions",               accent: "blue" },
  { href: "/dashboard/recruiter/applications",  icon: ClipboardList,title: "Applications",  description: "Review who applied to your jobs",              accent: "emerald" },
  { href: "/dashboard/outreach",                icon: Mail,         title: "AI Outreach",   description: "Generate personalized candidate emails",       accent: "cyan" },
  { href: "/dashboard/chat",                    icon: MessageCircle,title: "Messages",      description: "Connect with candidates directly",             accent: "rose" },
];

// ─── Variants ─────────────────────────────────────────────────────────────────

const ease = [0.25, 0.1, 0.25, 1] as const;

const pageVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.04 } },
};
const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease } },
};
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease } },
};

// ─── Props ────────────────────────────────────────────────────────────────────

type Props = {
  role: string;
  displayName: string;
  xp: number;
  level: number;
  xpProgress: number;
  userId: string;
  recruiterPosition?: string | null;
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export function DashboardView({
  role,
  displayName,
  xp,
  level,
  xpProgress,
  userId,
  recruiterPosition,
}: Props) {
  const features = role === "recruiter" ? recruiterFeatures : candidateFeatures;
  const allFeatures: Feature[] =
    role === "candidate"
      ? [
          ...features,
          {
            href: `/dashboard/candidates/${userId}`,
            icon: User,
            title: "My Portfolio",
            description: "View your public profile page",
            accent: "orange" as AccentKey,
          },
        ]
      : features;

  return (
    <>
      {/* Ambient background globs — fixed so they stay as the page scrolls */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -right-24 -top-24 h-[480px] w-[480px] rounded-full opacity-100"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute -bottom-32 left-1/4 h-[400px] w-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)", filter: "blur(70px)" }}
        />
        <div
          className="absolute right-1/3 top-1/2 h-[280px] w-[280px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.07) 0%, transparent 70%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute left-1/2 top-1/4 h-[200px] w-[200px] -translate-x-1/2 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)", filter: "blur(50px)" }}
        />
      </div>

      <motion.div
        variants={pageVariants}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-6xl space-y-10 p-6 md:p-8 lg:p-10"
      >
        {/* Welcome banner */}
        <motion.div variants={sectionVariants}>
          <WelcomeBanner
            role={role}
            displayName={displayName}
            xp={xp}
            level={level}
            xpProgress={xpProgress}
            recruiterPosition={recruiterPosition}
          />
        </motion.div>

        {/* Hilo featured card — candidates only */}
        {role === "candidate" && (
          <motion.div variants={sectionVariants}>
            <SectionLabel index="00" label="featured" />
            <HiloFeaturedCard />
          </motion.div>
        )}

        {/* Feature grid */}
        <motion.div variants={sectionVariants}>
          <SectionLabel index="01" label="quick access" />
          <motion.div
            variants={gridVariants}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {allFeatures.map((feature, i) => (
              <motion.div key={feature.href} variants={cardVariants}>
                <FeatureCard feature={feature} index={i} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
      [ {index} ] {label}
    </p>
  );
}

// ─── Welcome banner ───────────────────────────────────────────────────────────

function WelcomeBanner({
  role,
  displayName,
  xp,
  level,
  xpProgress,
  recruiterPosition,
}: {
  role: string;
  displayName: string;
  xp: number;
  level: number;
  xpProgress: number;
  recruiterPosition?: string | null;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-8 backdrop-blur-xl md:p-10"
      style={{ boxShadow: "0 0 60px rgba(139,92,246,0.06), 0 1px 0 rgba(255,255,255,0.05) inset" }}
    >
      {/* Subtle inner top highlight */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.15) 40%, rgba(255,255,255,0.22) 60%, transparent)" }}
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: greeting */}
        <div className="space-y-3">
          <div
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-sm"
            style={{ boxShadow: "0 0 12px rgba(16,185,129,0.15)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-400">
              Welcome back
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {displayName}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">
              {role === "candidate"
                ? "Continue your career journey"
                : "Manage your talent pipeline"}
            </p>
          </div>
        </div>

        {/* Right: XP widget (candidates) */}
        {role === "candidate" && (
          <div className="space-y-3 sm:min-w-[210px] sm:text-right">
            <div className="flex items-center gap-2 sm:justify-end">
              <span
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-violet-300 backdrop-blur-sm"
                style={{ boxShadow: "0 0 16px rgba(139,92,246,0.2)" }}
              >
                <TrendingUp className="h-3 w-3" />
                L.{level}
              </span>
              <span className="inline-flex items-center gap-1 rounded-lg border border-zinc-700/50 bg-white/[0.04] px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-zinc-300 backdrop-blur-sm">
                {xp} XP
              </span>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                <span>progress</span>
                <span>{100 - (xp % 100)} to next</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full border border-zinc-800/60 bg-zinc-900/60">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress * 100}%` }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.55 }}
                  style={{ boxShadow: "0 0 10px rgba(139,92,246,0.6)" }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Right: role badge (recruiter) */}
        {role === "recruiter" && (
          <div className="sm:text-right">
            <span
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-300 backdrop-blur-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px rgba(52,211,153,0.8)" }} />
              Recruiter
            </span>
            {recruiterPosition && (
              <p className="mt-2 text-sm text-zinc-500">{recruiterPosition}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hilo featured card ───────────────────────────────────────────────────────

function HiloFeaturedCard() {
  return (
    <div
      className="relative flex flex-col overflow-hidden rounded-xl border border-violet-500/10 bg-zinc-950/60 opacity-75 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      style={{ boxShadow: "0 0 40px rgba(139,92,246,0.06), 0 1px 0 rgba(255,255,255,0.03) inset" }}
    >
      <style>{`
        @keyframes hilo-spin-a { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes hilo-spin-b { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        .hilo-sq-a { animation: hilo-spin-a 10s linear infinite; }
        .hilo-sq-b { animation: hilo-spin-b 6s linear infinite; }
      `}</style>

      {/* Radial glow inside the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl"
        style={{ background: "radial-gradient(ellipse at 75% 50%, rgba(109,40,217,0.1) 0%, transparent 60%)" }}
      />

      {/* Top shimmer */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px rounded-t-xl"
        style={{ background: "linear-gradient(to right, transparent, rgba(167,139,250,0.3) 40%, rgba(196,181,253,0.4) 60%, transparent)" }}
      />

      {/* Left: content */}
      <div className="relative z-10 space-y-4 p-8 sm:p-10">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-500/8 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.28em] text-violet-400 backdrop-blur-sm"
          >
            <span className="h-1 w-1 rounded-full bg-violet-400" />
            Coming Soon
          </span>
          <span className="rounded-full border border-zinc-800/60 bg-white/[0.02] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.28em] text-zinc-600 backdrop-blur-sm">
            Next Update
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] tracking-[0.35em] text-violet-400/60">HILO</span>
          <span className="h-px w-6 bg-violet-700/30" />
          <span className="font-mono text-[9px] tracking-[0.22em] text-zinc-700">AI VOICE COACH · 001</span>
        </div>

        <div>
          <h3 className="text-xl font-bold text-zinc-300 sm:text-2xl">AI Voice Sessions</h3>
          <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-zinc-500">
            Practice interviews, get real-time coaching, and sharpen your pitch
            with an AI that listens, adapts, and pushes you forward.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-700">
          <span className="h-1.5 w-1.5 rounded-full bg-zinc-700" />
          Fully releasing in the next update
        </div>
      </div>

      {/* Right: decoration + disabled CTA */}
      <div className="relative z-10 flex shrink-0 flex-col items-center gap-6 px-8 pb-8 sm:pb-0 sm:pr-12">
        <div aria-hidden className="relative hidden h-20 w-20 items-center justify-center sm:flex">
          <div className="hilo-sq-a absolute h-16 w-16 rounded-sm border border-violet-700/20" />
          <div className="hilo-sq-b absolute h-10 w-10 rounded-sm border border-violet-500/15" />
          <div className="absolute h-2.5 w-2.5 rounded-full bg-zinc-700" />
        </div>

        <div
          className="flex cursor-not-allowed items-center gap-2.5 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-6 py-3 font-mono text-[11px] uppercase tracking-[0.28em] text-zinc-600 backdrop-blur-sm"
        >
          Coming Soon
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  const Icon = feature.icon;
  const a = ACCENTS[feature.accent];
  return (
    <Link
      href={feature.href}
      className="group relative flex h-full flex-col rounded-xl border border-zinc-800/60 bg-zinc-950/50 p-6 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
    >
      {/* Top-edge highlight */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px rounded-t-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `linear-gradient(to right, transparent, ${a.topHighlight} 60%, transparent)` }}
      />

      {/* Hover neon glow overlay */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ boxShadow: `0 0 28px ${a.insetGlow} inset` }}
      />

      {/* Icon box */}
      <div
        className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/60 transition-all duration-200 ${a.iconBorder} ${a.iconBg}`}
      >
        <Icon className={`h-4 w-4 text-zinc-500 transition-colors duration-200 ${a.iconColor}`} />
      </div>

      {/* Number + title */}
      <div className="mb-1.5 flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="text-[15px] font-semibold text-white">{feature.title}</h3>
      </div>

      <p className="text-sm leading-relaxed text-zinc-500">{feature.description}</p>

      <ArrowRight className={`absolute right-5 top-5 h-4 w-4 text-zinc-700 transition-all duration-200 group-hover:translate-x-0.5 ${a.arrowColor}`} />
    </Link>
  );
}
