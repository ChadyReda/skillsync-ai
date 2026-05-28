import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service — SkillSync",
  description: "The terms governing your use of the SkillSync platform.",
};

const LAST_UPDATED = "May 28, 2026";

export default function TermsPage() {
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
          <FileText className="h-3 w-3" />
          Terms
        </span>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-24 pt-4">
        {/* Title */}
        <div className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">
            [ legal / terms-of-service ]
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Terms of Service
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

            <Notice title="The short version">
              SkillSync is a free, non-commercial project. Use it responsibly,
              don't abuse it, and don't upload content you don't have the right
              to share. Your content belongs to you. We provide the platform
              as-is with no guarantees.
            </Notice>

            <Section index="01" title="Acceptance of terms">
              By accessing or using SkillSync you agree to these Terms of
              Service. If you do not agree, please do not use the platform.
              These terms apply to all users — candidates and recruiters alike.
            </Section>

            <Section index="02" title="Nature of the platform">
              SkillSync is a non-commercial, personal project built for
              educational and demonstration purposes. It is provided free of
              charge with no subscription, no payment, and no commercial
              intent. The platform is in active beta and may change, go offline,
              or be discontinued at any time without prior notice.
            </Section>

            <Section index="03" title="Eligibility">
              You must be at least 16 years old to use SkillSync. By registering,
              you confirm that the information you provide is accurate and that
              you have the legal capacity to enter into these terms.
            </Section>

            <Section index="04" title="Your account">
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <Li>You are responsible for keeping your login credentials secure.</Li>
                <Li>You must not share your account with others or impersonate another person.</Li>
                <Li>You may delete your account at any time. Upon deletion your data will be permanently removed from our database.</Li>
                <Li>We reserve the right to suspend or terminate accounts that violate these terms.</Li>
              </ul>
            </Section>

            <Section index="05" title="Acceptable use">
              <p className="mb-3 text-sm text-zinc-400">You agree not to:</p>
              <ul className="space-y-2 text-sm text-zinc-400">
                <Li>Upload content that is illegal, harmful, defamatory, or that you do not have the right to share.</Li>
                <Li>Attempt to reverse-engineer, scrape, or exploit the platform or its APIs.</Li>
                <Li>Use the platform to spam, harass, or harm other users.</Li>
                <Li>Upload malware, viruses, or any malicious code.</Li>
                <Li>Post misleading job listings or impersonate a company you do not represent.</Li>
              </ul>
            </Section>

            <Section index="06" title="Your content">
              Content you create on SkillSync — posts, profile information, CV
              data — remains yours. You grant SkillSync a limited, non-exclusive
              licence to store and display your content solely for the purpose
              of operating the platform. We do not claim ownership of your
              content and we do not use it for commercial purposes.
            </Section>

            <Section index="07" title="AI-generated content">
              SkillSync uses AI models (via OpenRouter / Anthropic) to generate
              resume insights, career suggestions, and roadmaps. This output is
              provided for informational purposes only.
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <Li>AI insights are not professional career, legal, or financial advice.</Li>
                <Li>We do not guarantee the accuracy or completeness of AI-generated content.</Li>
                <Li>You are solely responsible for decisions made based on AI suggestions.</Li>
              </ul>
            </Section>

            <Section index="08" title="Recruiter responsibilities">
              If you use SkillSync as a recruiter, you agree that:
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                <Li>All job postings are accurate and represent real opportunities.</Li>
                <Li>You will not use candidate data for purposes outside of genuine hiring.</Li>
                <Li>You will not contact candidates through the platform for spam or unsolicited commercial outreach.</Li>
              </ul>
            </Section>

            <Section index="09" title="Intellectual property">
              The SkillSync name, logo, and original code are the property of
              their respective creators. You may not reproduce or redistribute
              the platform's source code or branding without permission.
              Third-party libraries and services retain their own licences.
            </Section>

            <Section index="10" title="Disclaimer of warranties">
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/[0.05] dark:text-amber-300/80">
                SkillSync is provided <strong className="text-amber-800 dark:text-amber-200">"as is"</strong> and{" "}
                <strong className="text-amber-800 dark:text-amber-200">"as available"</strong> without any warranty of any
                kind — express or implied — including but not limited to warranties of
                merchantability, fitness for a particular purpose, or
                non-infringement. We do not guarantee that the platform will be
                uninterrupted, error-free, or secure at all times.
              </div>
            </Section>

            <Section index="11" title="Limitation of liability">
              To the fullest extent permitted by applicable law, SkillSync and
              its creators shall not be liable for any indirect, incidental,
              special, or consequential damages arising from your use of or
              inability to use the platform — including but not limited to loss
              of data, missed opportunities, or career decisions made based on
              AI output.
            </Section>

            <Section index="12" title="Changes to these terms">
              We may update these terms from time to time. The "last updated"
              date at the top of this page reflects the most recent revision.
              Continued use of the platform after changes constitutes
              acceptance of the revised terms.
            </Section>

            <Section index="13" title="Governing law">
              These terms are governed by the laws of Morocco. Any disputes
              arising from your use of SkillSync shall be subject to the
              jurisdiction of Moroccan courts.
            </Section>

            <Section index="14" title="Contact">
              Questions about these terms?
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
          <Link href="/privacy" className="transition-colors hover:text-zinc-400">Privacy Policy</Link>
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

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-4">
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
