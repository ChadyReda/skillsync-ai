"use client";

import { useState, useTransition } from "react";
import { completeOnboarding } from "@/app/onboarding/actions";
import {
  Briefcase,
  Users,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
} from "lucide-react";

type Role = "candidate" | "recruiter";

const roles = [
  {
    id: "candidate" as Role,
    icon: Briefcase,
    title: "Candidate",
    description: "Looking for opportunities and growing my career with AI tools.",
  },
  {
    id: "recruiter" as Role,
    icon: Users,
    title: "Recruiter",
    description: "Finding top talent to build exceptional teams.",
  },
];

export default function OnboardingForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [stepKey, setStepKey] = useState(0);
  const [role, setRole] = useState<Role>("candidate");
  const [pending, startTransition] = useTransition();

  const selectedRole = roles.find((r) => r.id === role)!;

  const goToStep = (s: 1 | 2) => {
    setStep(s);
    setStepKey((k) => k + 1);
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      await completeOnboarding({
        role,
        fullName: formData.get("fullName") as string,
        bio: formData.get("bio") as string,
        companyName: formData.get("companyName") as string,
        position: formData.get("position") as string,
      });
    });
  };

  return (
    <div className="w-full max-w-md">
      {/* Progress */}
      <div className="mb-10 flex items-center gap-3">
        {([1, 2] as const).map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                step > s
                  ? "bg-white text-black"
                  : step === s
                    ? "bg-white text-black shadow-[0_0_0_4px_rgba(255,255,255,0.12)]"
                    : "border border-zinc-700 text-zinc-500",
              ].join(" ")}
            >
              {step > s ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : s}
            </div>
            {i < 1 && (
              <div className="relative h-px w-12 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-500 ease-out"
                  style={{ width: step > 1 ? "100%" : "0%" }}
                />
              </div>
            )}
          </div>
        ))}
        <span className="ml-1 text-xs text-zinc-500">
          Step {step} of 2
        </span>
      </div>

      {/* Animated step panel */}
      <div key={stepKey} className="step-enter">
        {step === 1 && (
          <div>
            <div className="mb-8">
              <h1 className="text-[26px] font-bold leading-tight tracking-tight text-white">
                How will you use SkillSync?
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                Choose your role to get a personalized experience.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const selected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={[
                      "group relative flex flex-col gap-5 rounded-2xl border p-5 text-left transition-all duration-200",
                      selected
                        ? "border-white/20 bg-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.5)]"
                        : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900/60",
                    ].join(" ")}
                  >
                    {selected && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-white">
                        <Check className="h-3 w-3 text-black" strokeWidth={3} />
                      </span>
                    )}

                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200",
                        selected
                          ? "bg-white text-black"
                          : "bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200",
                      ].join(" ")}
                    >
                      <r.icon className="h-[18px] w-[18px]" />
                    </div>

                    <div>
                      <p className="text-[15px] font-semibold text-white">
                        {r.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                        {r.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => goToStep(2)}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98]"
            >
              Continue as {selectedRole.title}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-8">
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="mb-5 flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-white"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </button>
              <h1 className="text-[26px] font-bold leading-tight tracking-tight text-white">
                Set up your profile
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Tell us a bit about yourself.
              </p>
            </div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5">
              <selectedRole.icon className="h-3.5 w-3.5 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-300">
                {selectedRole.title}
              </span>
            </div>

            <form action={handleSubmit} className="space-y-4">
              {role === "candidate" && (
                <>
                  <Field label="Full Name">
                    <input
                      name="fullName"
                      placeholder="Alex Johnson"
                      required
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-zinc-600 focus:ring-2 focus:ring-white/5"
                    />
                  </Field>
                  <Field label="Bio (optional)">
                    <textarea
                      name="bio"
                      placeholder="Tell us about your background, skills, and goals..."
                      rows={3}
                      className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-zinc-600 focus:ring-2 focus:ring-white/5"
                    />
                  </Field>
                </>
              )}

              {role === "recruiter" && (
                <>
                  <Field label="Company Name">
                    <input
                      name="companyName"
                      placeholder="Acme Corp"
                      required
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-zinc-600 focus:ring-2 focus:ring-white/5"
                    />
                  </Field>
                  <Field label="Your Position">
                    <input
                      name="position"
                      placeholder="Head of Talent Acquisition"
                      required
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition-all duration-200 focus:border-zinc-600 focus:ring-2 focus:ring-white/5"
                    />
                  </Field>
                </>
              )}

              <button
                type="submit"
                disabled={pending}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-black transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Setting up…
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-zinc-400">{label}</label>
      {children}
    </div>
  );
}
