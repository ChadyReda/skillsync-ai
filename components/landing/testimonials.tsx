const TESTIMONIALS = [
  {
    quote:
      "I applied to 60+ companies over four months and heard back from two. Started using SkillSync, optimised my resume based on the AI score, and got three interviews in the first week. The roadmap feature showed me exactly which skills were blocking me.",
    name: "Sarah Kim",
    role: "Senior Software Engineer",
    company: "Notion",
    initials: "SK",
    hue: "from-violet-600 to-indigo-700",
  },
  {
    quote:
      "The recruiter matching is unlike anything else I've used. I wasn't applying to them — they were finding me. Within two weeks I had conversations with four companies I had wanted to work at for years. Took the offer from Linear.",
    name: "Marcus Chen",
    role: "Product Engineer",
    company: "Linear",
    initials: "MC",
    hue: "from-sky-600 to-blue-700",
  },
  {
    quote:
      "I was skeptical of another AI job tool. But the resume score caught a real problem: my titles were too vague for ATS systems. Fixed that, reran the AI analysis, score went from 61 to 89. Got a callback from Stripe the same week.",
    name: "Amara Diallo",
    role: "UX Design Lead",
    company: "Stripe",
    initials: "AD",
    hue: "from-emerald-600 to-teal-700",
  },
];

export function Testimonials() {
  return (
    <section className="border-b border-zinc-800 bg-black px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
              [ 04 ] real results
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              People who stopped
              <br />
              searching and started landing
            </h2>
          </div>
          <p className="max-w-xs text-sm text-zinc-500">
            These are real outcomes from real users — not cherry-picked edge cases.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between gap-8 bg-black p-7 transition-colors hover:bg-zinc-950"
            >
              {/* Quote */}
              <div>
                {/* Stars */}
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      viewBox="0 0 12 12"
                      fill="currentColor"
                      className="h-3 w-3 text-zinc-400"
                      aria-hidden
                    >
                      <path d="M6 .5l1.55 3.14 3.47.5-2.51 2.45.59 3.45L6 8.25l-3.1 1.79.6-3.45L.99 4.14l3.47-.5L6 .5z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-[15px] leading-relaxed text-zinc-300">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
              </div>

              {/* Person */}
              <div className="flex items-center gap-3 border-t border-zinc-800/60 pt-5">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${t.hue} font-mono text-[10px] font-semibold text-white`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="font-mono text-[10px] text-zinc-500">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
