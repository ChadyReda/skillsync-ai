import { FileText, Sparkles, Rocket } from "lucide-react";

const STEPS = [
  {
    index: "01",
    icon: FileText,
    title: "Build your profile",
    description:
      "Upload your CV and GitHub. Our AI instantly parses your skills, experience, and generates a match score.",
    visual: (
      <div className="relative h-28 w-full overflow-hidden border border-zinc-800 bg-zinc-950">
        {/* Resume preview visual */}
        <div className="absolute left-4 top-4 flex flex-col gap-1.5">
          <div className="h-2 w-24 rounded-none bg-zinc-800" />
          <div className="h-1.5 w-16 rounded-none bg-zinc-800/70" />
          <div className="mt-1 h-1 w-28 rounded-none bg-zinc-800/50" />
          <div className="h-1 w-20 rounded-none bg-zinc-800/50" />
          <div className="h-1 w-24 rounded-none bg-zinc-800/50" />
        </div>
        {/* AI scan line */}
        <div className="absolute inset-x-0 top-[45%] h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
        <div className="absolute right-4 top-4 flex flex-col items-end gap-1">
          <div className="border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 font-mono text-[10px] text-emerald-400">
            Score: 87
          </div>
          <div className="border border-zinc-800 bg-zinc-900 px-2 py-1 font-mono text-[9px] text-zinc-500">
            AI ✓ Parsed
          </div>
        </div>
      </div>
    ),
  },
  {
    index: "02",
    icon: Sparkles,
    title: "AI personalises your path",
    description:
      "Get AI-generated learning roadmaps, career advice, and job matches tailored exactly to your profile.",
    visual: (
      <div className="relative h-28 w-full overflow-hidden border border-zinc-800 bg-zinc-950 p-4">
        {/* Roadmap nodes */}
        <div className="flex h-full items-center gap-0">
          {[
            { label: "React", done: true },
            { label: "TypeScript", done: true },
            { label: "Next.js", done: false },
            { label: "AWS", done: false },
          ].map((node, i) => (
            <div key={node.label} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={[
                    "flex h-8 w-8 items-center justify-center border text-[8px] font-mono",
                    node.done
                      ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-400"
                      : "border-zinc-700 bg-zinc-900 text-zinc-600",
                  ].join(" ")}
                >
                  {node.done ? "✓" : String(i + 1)}
                </div>
                <span className="text-[8px] text-zinc-600">{node.label}</span>
              </div>
              {i < 3 && (
                <div
                  className={[
                    "h-px w-4",
                    node.done ? "bg-emerald-400/50" : "bg-zinc-800",
                  ].join(" ")}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    index: "03",
    icon: Rocket,
    title: "Connect and land the role",
    description:
      "Apply to curated job matches and chat directly with recruiters — all without leaving the platform.",
    visual: (
      <div className="relative h-28 w-full overflow-hidden border border-zinc-800 bg-zinc-950 p-3">
        {/* Job cards */}
        <div className="flex flex-col gap-1.5">
          {[
            { role: "Senior Frontend Eng.", company: "Vercel",  match: "96%" },
            { role: "Full-Stack Developer",  company: "Linear",  match: "89%" },
          ].map((job) => (
            <div
              key={job.company}
              className="flex items-center justify-between border border-zinc-800 bg-zinc-900 px-3 py-2"
            >
              <div>
                <p className="text-[9px] font-medium text-white">{job.role}</p>
                <p className="font-mono text-[8px] text-zinc-500">{job.company}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="border border-emerald-400/30 bg-emerald-400/10 px-1.5 py-0.5 font-mono text-[8px] text-emerald-400">
                  {job.match}
                </span>
                <div className="h-5 w-12 border border-zinc-700 bg-black text-center font-mono text-[8px] leading-5 text-zinc-400">
                  Apply
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-zinc-800 bg-black px-4 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-14 max-w-xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-zinc-500">
            [ 05 ] how it works
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Three steps to your next role
          </h2>
          <p className="mt-3 text-zinc-500">
            From profile to placement — SkillSync handles the intelligence, you handle the decisions.
          </p>
        </div>

        {/* Steps */}
        <div className="grid gap-px border border-zinc-800 bg-zinc-800 sm:grid-cols-3">
          {STEPS.map(({ index, icon: Icon, title, description, visual }) => (
            <div
              key={index}
              className="flex flex-col gap-4 bg-black p-6 transition-colors hover:bg-zinc-950"
            >
              {/* Visual */}
              {visual}

              {/* Step number + icon */}
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">
                  {index}
                </span>
                <div className="flex h-8 w-8 items-center justify-center border border-zinc-800 bg-zinc-950">
                  <Icon className="h-4 w-4 text-zinc-400" />
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="text-[15px] font-semibold text-white">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
