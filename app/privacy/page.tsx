import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — SkillSync",
  description: "How SkillSync collects, uses, and protects your data.",
};

const LAST_UPDATED = "May 28, 2026";

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen bg-black text-white">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[360px] opacity-30"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(255,255,255,0.1), transparent 70%)",
        }}
      />

      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to SkillSync
        </Link>
        <span className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400 backdrop-blur-sm">
          <Shield className="h-3 w-3" />
          Privacy
        </span>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-4">
        {/* Title */}
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            [ legal / privacy-policy ]
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Last updated: {LAST_UPDATED}
          </p>
        </div>

        {/* Content */}
        <div
          className="overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
        >
          <div className="space-y-8 p-6 sm:p-8">

            <Notice
              title="The short version"
              highlight
            >
              SkillSync is a non-commercial student project. We collect only what
              we need to run the platform. We do not sell, rent, or share your
              data with advertisers or any third party for commercial purposes.
              Your data is yours.
            </Notice>

            <Section index="01" title="Who we are">
              SkillSync is a non-commercial, educational AI career platform built
              as a personal project. It is not operated by a registered company.
              There is no commercial intent behind data collection — the platform
              exists solely to provide career tools to its users.
            </Section>

            <Section index="02" title="What data we collect">
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <Li><strong className="text-zinc-200">Account information</strong> — your name, email address, and profile picture, provided through Clerk authentication (Google, GitHub, or email).</Li>
                <Li><strong className="text-zinc-200">Profile data</strong> — role (candidate/recruiter), bio, career information, and any data you choose to add during onboarding.</Li>
                <Li><strong className="text-zinc-200">Resume / CV</strong> — the file you upload and the AI-extracted text and insights derived from it. Stored via UploadThing.</Li>
                <Li><strong className="text-zinc-200">GitHub data</strong> — if you connect your GitHub username, we fetch your public repository and contribution data from the GitHub public API.</Li>
                <Li><strong className="text-zinc-200">Activity data</strong> — posts you publish, jobs you apply to, roadmaps you create, and messages you send within the platform.</Li>
                <Li><strong className="text-zinc-200">Usage data</strong> — basic server logs (IP address, browser, timestamps) collected automatically for debugging.</Li>
              </ul>
            </Section>

            <Section index="03" title="How we use your data">
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <Li>To operate the platform and provide its core features.</Li>
                <Li>To generate AI-powered insights about your resume, skills, and career path using OpenRouter (Anthropic Claude models).</Li>
                <Li>To match candidates with relevant job postings.</Li>
                <Li>To send transactional emails (application updates, roadmap progress) via Resend.</Li>
                <Li>To display your public portfolio to recruiters if you choose to make it visible.</Li>
              </ul>
              <p className="mt-4 text-sm text-zinc-500">
                We do <strong className="text-zinc-300">not</strong> use your data for advertising, user profiling for commercial purposes, or sell it to any third party.
              </p>
            </Section>

            <Section index="04" title="Third-party services">
              <p className="mb-3 text-sm text-zinc-400">
                We rely on the following trusted services to operate. Each has their own privacy policy:
              </p>
              <div className="overflow-hidden rounded-lg border border-zinc-800/60">
                {[
                  { name: "Clerk", purpose: "Authentication & user management", link: "https://clerk.com/privacy" },
                  { name: "Neon (PostgreSQL)", purpose: "Database hosting", link: "https://neon.tech/privacy" },
                  { name: "UploadThing", purpose: "File storage (CVs)", link: "https://uploadthing.com/privacy" },
                  { name: "OpenRouter / Anthropic", purpose: "AI inference (resume analysis, chat)", link: "https://openrouter.ai/privacy" },
                  { name: "Resend", purpose: "Transactional email delivery", link: "https://resend.com/privacy" },
                  { name: "Vercel", purpose: "Hosting & deployment", link: "https://vercel.com/legal/privacy-policy" },
                ].map((s, i, arr) => (
                  <div
                    key={s.name}
                    className={`flex items-center justify-between gap-4 px-4 py-3 text-sm ${i < arr.length - 1 ? "border-b border-zinc-800/60" : ""}`}
                  >
                    <div>
                      <span className="font-medium text-zinc-200">{s.name}</span>
                      <span className="ml-2 text-zinc-600">—</span>
                      <span className="ml-2 text-zinc-500">{s.purpose}</span>
                    </div>
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-zinc-600 transition-colors hover:text-zinc-300"
                    >
                      Policy ↗
                    </a>
                  </div>
                ))}
              </div>
            </Section>

            <Section index="05" title="Data retention">
              Your data is retained for as long as your account is active. If you
              delete your account, your profile, posts, and associated data are
              permanently deleted from our database. Uploaded files may persist
              on UploadThing for up to 30 days before being purged.
            </Section>

            <Section index="06" title="Your rights">
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <Li><strong className="text-zinc-200">Access</strong> — you can view all your data directly within your dashboard.</Li>
                <Li><strong className="text-zinc-200">Correction</strong> — you can update your profile information at any time.</Li>
                <Li><strong className="text-zinc-200">Deletion</strong> — you can request full account and data deletion by contacting us at the email below.</Li>
                <Li><strong className="text-zinc-200">Portability</strong> — contact us to request an export of your data.</Li>
              </ul>
            </Section>

            <Section index="07" title="Cookies">
              We use only functional cookies necessary to maintain your session
              (set by Clerk). We do not use tracking, advertising, or analytics
              cookies.
            </Section>

            <Section index="08" title="Children">
              SkillSync is not intended for users under the age of 16. We do not
              knowingly collect personal data from children.
            </Section>

            <Section index="09" title="Changes to this policy">
              If we make material changes to this policy, we will update the
              "last updated" date at the top of this page. Continued use of the
              platform after changes constitutes acceptance.
            </Section>

            <Section index="10" title="Contact">
              Questions about this policy or your data?
              <br />
              <a
                href="mailto:redallahdehbi@gmail.com"
                className="mt-1 inline-block font-mono text-sm text-zinc-300 underline underline-offset-4 transition-colors hover:text-white"
              >
                redallahdehbi@gmail.com
              </a>
            </Section>

          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 font-mono text-[10px] uppercase tracking-wider text-zinc-700">
          <Link href="/terms" className="transition-colors hover:text-zinc-400">Terms of Service</Link>
          <Link href="/report" className="transition-colors hover:text-zinc-400">Report an Issue</Link>
        </div>
      </section>
    </main>
  );
}

function Section({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">{index}</span>
        <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-zinc-300">{title}</h2>
      </div>
      {typeof children === "string" ? (
        <p className="text-sm leading-relaxed text-zinc-400">{children}</p>
      ) : (
        children
      )}
    </div>
  );
}

function Notice({ title, highlight, children }: { title: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? "border-zinc-700/50 bg-zinc-900/40" : "border-zinc-800/60"}`}>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">{title}</p>
      <p className="text-sm leading-relaxed text-zinc-300">{children}</p>
    </div>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-700" />
      <span>{children}</span>
    </li>
  );
}
