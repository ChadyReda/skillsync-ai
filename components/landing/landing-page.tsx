"use client";

import Image from "next/image";
import Link from "next/link";
import { type ElementType } from "react";
import { SignUpButton, useUser } from "@clerk/nextjs";
import { ArrowRight, FileText, Map, Users } from "lucide-react";

import { useTranslation } from "@/lib/i18n/language-context";
import { LogoCloud } from "@/components/ui/logo-cloud";
import { ShaderAnimation } from "@/components/ui/shader-animation";
import { LandingNav } from "@/components/landing/landing-nav";
import { CTASection } from "@/components/landing/cta-section";
import { Testimonials } from "@/components/landing/testimonials";

// ─── Constants ────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();

const FOOTER_LINKS = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Install App", href: "/install" },
  { label: "Report an Issue", href: "/report" },
];

// 3 key features — quality over quantity
const KEY_FEATURES: { icon: ElementType; title: string; body: string }[] = [
  {
    icon: FileText,
    title: "Resume Intelligence",
    body: "AI reads your CV like a recruiter and returns a score, detected gaps, and line-by-line rewrites — in under 30 seconds.",
  },
  {
    icon: Map,
    title: "Personalised Roadmaps",
    body: "Based on your current skills and target role, SkillSync builds a 90-day learning plan that actually fits your schedule.",
  },
  {
    icon: Users,
    title: "Recruiter Discovery",
    body: "Recruiters search SkillSync for candidates. Fill your profile and let them come to you — without changing a single application.",
  },
];

// Avatar stack for trust signal
const AVATARS = [
  "from-violet-600 to-indigo-700",
  "from-sky-600 to-blue-700",
  "from-emerald-600 to-teal-700",
  "from-orange-500 to-rose-600",
  "from-pink-600 to-purple-700",
];

// ─── Component ────────────────────────────────────────────────
export function LandingPage() {
  const { t } = useTranslation();
  const { isSignedIn } = useUser();

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* ════════════════════════════════════════
          NAV
      ════════════════════════════════════════ */}
      <LandingNav />

      {/* ════════════════════════════════════════
          HERO — static, bold, outcome-focused
      ════════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center pt-14 overflow-hidden">
        {/* Three.js ring shader */}
        <div
          className="pointer-events-none absolute inset-0 opacity-25"
          aria-hidden
        >
          <ShaderAnimation className="absolute inset-0 w-full h-full" />
        </div>

        {/* Subtle radial vignette to keep text readable */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 30%, rgba(0,0,0,0.45) 100%)",
          }}
        />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-32 text-center sm:px-6">
          {/* Status badge */}
          <div
            className="mb-10 inline-flex items-center gap-2.5 rounded-full border border-green-700/30 px-4 py-2 backdrop-blur-sm"
            style={{
              background:
                "linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(52,211,153,0.10) 50%, rgba(5,150,105,0.16) 100%)",
              boxShadow:
                "0 0 24px rgba(16,185,129,0.15), 0 1px 0 rgba(255,255,255,0.06) inset",
            }}
          >
            {/* Moroccan flag SVG */}
            {/*<svg
              width="20"
              height="14"
              viewBox="0 0 20 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0 rounded-[2px]"
              aria-label="Moroccan flag"
            >
              <rect width="20" height="14" fill="#C1272D" />
              <path
                d="M10 3.5 L10.9 6.3 L13.8 6.3 L11.5 8 L12.4 10.8 L10 9.1 L7.6 10.8 L8.5 8 L6.2 6.3 L9.1 6.3 Z"
                fill="none"
                stroke="#006233"
                strokeWidth="0.7"
              />
            </svg>*/}
            🟢
            <span className="h-3 w-px bg-white-500/30" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white">
              All services are online
            </span>
          </div>

          {/* Headline — the most important element on the page */}
          <h1 className="text-balance text-5xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-7xl lg:text-[88px]">
            Stop searching.
            <br />
            <span className="text-zinc-500">Start landing.</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-7 max-w-xl text-balance text-lg leading-relaxed text-zinc-500 sm:text-xl">
            SkillSync uses AI to score your resume, build your roadmap, and put
            you in front of recruiters who are actively hiring — all in one
            place.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 bg-white px-8 font-mono text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100 sm:w-auto"
              >
                Workspace
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <SignUpButton
                mode="modal"
                forceRedirectUrl="/onboarding"
                signInForceRedirectUrl="/dashboard"
              >
                <button className="group inline-flex h-12 w-full items-center justify-center gap-2 bg-white px-8 font-mono text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100 sm:w-auto">
                  Start for free
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </SignUpButton>
            )}
            <a
              href="#features"
              className="inline-flex h-12 w-full items-center justify-center gap-2 border border-zinc-800 bg-zinc-950/60 px-8 font-mono text-sm uppercase tracking-wider text-zinc-400 backdrop-blur-sm transition-colors hover:border-zinc-600 hover:text-white sm:w-auto"
            >
              See features
            </a>
          </div>

          {/* Trust signal — avatar stack + count */}
          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {AVATARS.map((gradient, i) => (
                <div
                  key={i}
                  className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${gradient} ring-2 ring-black font-mono text-[9px] font-semibold text-white`}
                >
                  {["SK", "MC", "AD", "JR", "LB"][i]}
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              <span className="font-semibold text-white">800+</span> career
              builders already inside
            </p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="relative w-full border-t border-zinc-800 bg-black/60 backdrop-blur-sm">
          <div className="mx-auto grid max-w-4xl grid-cols-3 divide-x divide-zinc-800">
            {t.stats.map((stat, i) => (
              <div key={stat.value} className="px-6 py-5 text-center">
                <p className="text-xl font-bold sm:text-2xl">{stat.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          BRAND STRIP — tech stack (honest)
      ════════════════════════════════════════ */}
      <section className="border-b border-zinc-800 bg-zinc-950 px-0 py-12">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            Powered by the infrastructure of the modern web
          </p>

          <LogoCloud />
        </div>
      </section>
      {/* ════════════════════════════════════════
          FEATURES — 3 key capabilities
      ════════════════════════════════════════ */}
      <section
        id="features"
        className="border-b border-zinc-800 bg-black px-4 py-20 sm:px-6 sm:py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 max-w-xl">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
              [ 02 ] capabilities
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Three tools.
              <br />
              One unfair advantage.
            </h2>
            <p className="mt-3 text-zinc-500">
              Most platforms give you job listings. SkillSync gives you the
              entire system — from polishing your profile to landing the
              interview.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {KEY_FEATURES.map(({ icon: Icon, title, body }, i) => (
              <div
                key={title}
                className="group relative flex flex-col gap-6 bg-black p-7 transition-colors hover:bg-zinc-950"
              >
                {/* Top accent line on hover */}
                <span
                  className="absolute left-0 top-0 h-px w-0 bg-white transition-all duration-500 group-hover:w-full"
                  aria-hidden
                />

                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center border border-zinc-800 bg-zinc-950 transition-colors group-hover:border-zinc-700 group-hover:bg-zinc-900">
                    <Icon className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-white" />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-700">
                    0{i + 1}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    {body}
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-600 transition-colors group-hover:text-zinc-400">
                  Learn more
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <div id="testimonials">
        <Testimonials />
      </div>

      {/* ════════════════════════════════════════
          CTA
      ════════════════════════════════════════ */}
      <CTASection />

      {/* ════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════ */}
      <footer className="border-t border-zinc-800 bg-black px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="SkillSync"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-sm font-semibold">SkillSync</span>
            </div>

            {/* Nav */}
            <nav
              className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              aria-label="Footer"
            >
              {FOOTER_LINKS.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-600 transition-colors hover:text-zinc-300"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </nav>

            {/* Social */}
            <div className="flex items-center gap-2">
              {/* GitHub */}
              <a
                href="https://github.com/ChadyReda/skillsync-ai"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center border border-zinc-800 bg-zinc-950 text-zinc-600 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.02c-3.2.7-3.88-1.36-3.88-1.36-.52-1.34-1.27-1.69-1.27-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.76 2.69 1.25 3.35.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.71 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.44-2.69 5.41-5.25 5.7.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55C20.21 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
                </svg>
              </a>
              {/* X / Twitter */}
              <a
                href="https://twitter.com/skillsync_ai"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="X / Twitter"
                className="flex h-8 w-8 items-center justify-center border border-zinc-800 bg-zinc-950 text-zinc-600 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/skillsync-ai"
                target="_blank"
                rel="noreferrer noopener"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center border border-zinc-800 bg-zinc-950 text-zinc-600 transition-colors hover:border-zinc-700 hover:text-zinc-200"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="my-6 border-t border-zinc-800" />

          <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-700">
            {t.footer.copyright}
          </p>
        </div>
      </footer>
    </div>
  );
}
