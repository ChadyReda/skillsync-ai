"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitQuiz } from "./actions";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Star,
  Loader2,
  Target,
  ChevronRight,
} from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizResult {
  score: number;
  passed: boolean;
  alreadyPassed?: boolean;
}

function ScoreRing({ score, passed }: { score: number; passed: boolean }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = passed ? "#34d399" : "#fafafa";

  return (
    <div className="relative flex h-32 w-32 items-center justify-center border border-zinc-800 bg-black">
      <svg className="absolute inset-0 -rotate-90" width="128" height="128">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#27272a"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="text-center">
        <div
          className={`text-3xl font-bold tabular-nums ${
            passed ? "text-emerald-400" : "text-white"
          }`}
        >
          {score}%
        </div>
      </div>
    </div>
  );
}

export default function QuizForm({
  roadmapId,
  questions,
}: {
  roadmapId: string;
  questions: Question[];
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [pending, startTransition] = useTransition();

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const progress =
    questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  function handleAnswer(index: number, option: string) {
    if (result || pending) return;
    setAnswers((prev) => ({ ...prev, [String(index)]: option }));
  }

  function handleSubmit() {
    if (!allAnswered || pending) return;
    startTransition(async () => {
      const res = await submitQuiz({ roadmapId, answers });
      setResult(res);
    });
  }

  /* ── Result screen ── */
  if (result) {
    const { score, passed, alreadyPassed } = result;

    return (
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-16 text-center">
        <ScoreRing score={score} passed={passed} />

        {passed ? (
          <span className="inline-flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Trophy className="h-3.5 w-3.5" />
            {alreadyPassed ? "Already Passed" : "Quiz Passed"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 border border-rose-500/40 bg-rose-500/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider text-rose-300">
            <XCircle className="h-3.5 w-3.5" />
            Not Passed
          </span>
        )}

        <div className="space-y-1">
          <p className="text-lg font-semibold text-white">
            {passed && alreadyPassed
              ? "You already completed this quiz."
              : passed
                ? "Congratulations. You nailed it."
                : "Not quite — keep at it."}
          </p>
          <p className="text-sm text-zinc-500">
            {!passed
              ? "You need at least 70% to pass. Review the roadmap and try again."
              : alreadyPassed
                ? "XP was already awarded for this quiz."
                : "Keep completing roadmaps to level up."}
          </p>
        </div>

        {passed && !alreadyPassed && (
          <div className="inline-flex items-center gap-2 border border-zinc-800 bg-zinc-950 px-4 py-2.5">
            <Star className="h-3.5 w-3.5 fill-white text-white" />
            <span className="font-mono text-xs uppercase tracking-wider text-white">
              +250 XP earned
            </span>
          </div>
        )}

        <div className="mt-2 flex gap-3">
          {!passed && (
            <button
              onClick={() => {
                setAnswers({});
                setResult(null);
              }}
              className="inline-flex items-center gap-2 border border-zinc-700 bg-zinc-950 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
            >
              Try Again
            </button>
          )}
          <button
            onClick={() => router.push(`/dashboard/roadmaps/${roadmapId}`)}
            className="inline-flex items-center gap-2 border border-white bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-zinc-100"
          >
            Back to Roadmap
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
      <div className="space-y-5">
        <button
          onClick={() => router.push(`/dashboard/roadmaps/${roadmapId}`)}
          className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-zinc-200"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to roadmap
        </button>

        <div className="border-b border-zinc-800 pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            [ 04 ] assessment
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
            <Target className="h-5 w-5" />
            Final Quiz
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {questions.length} questions · 70% to pass · 250 XP reward
          </p>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
            <span>
              {answeredCount}/{questions.length} answered
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1 overflow-hidden border border-zinc-800 bg-black">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => {
          const selected = answers[String(index)];
          return (
            <div
              key={index}
              className="space-y-4 border border-zinc-800 bg-zinc-950 p-5"
            >
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-zinc-700 bg-black font-mono text-xs font-bold text-zinc-300">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="pt-0.5 font-medium leading-relaxed text-white">
                  {question.question}
                </p>
              </div>

              <div className="space-y-2 pl-10">
                {question.options.map((option: string) => {
                  const isSelected = selected === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleAnswer(index, option)}
                      disabled={!!result || pending}
                      className={[
                        "group flex w-full items-center gap-3 border px-4 py-3 text-left text-sm transition-colors",
                        isSelected
                          ? "border-white bg-white text-black"
                          : "border-zinc-800 bg-black text-zinc-300 hover:border-zinc-600 hover:bg-zinc-900",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-4 w-4 shrink-0 items-center justify-center border",
                          isSelected
                            ? "border-black bg-black"
                            : "border-zinc-600 group-hover:border-zinc-400",
                        ].join(" ")}
                      >
                        {isSelected && (
                          <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                        )}
                      </span>
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-800 pb-8 pt-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          {!allAnswered
            ? `${questions.length - answeredCount} remaining`
            : "Ready to submit"}
        </p>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || pending}
          className="inline-flex items-center gap-2 border border-white bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Target className="h-4 w-4" />
          )}
          {pending ? "Submitting..." : "Submit Quiz"}
        </button>
      </div>
    </div>
  );
}
