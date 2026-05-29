import { eq } from "drizzle-orm";
import { db } from "@/src/index";
import { roadmapQuizzes } from "@/src/db/schemas/roadmap-quizzes";
import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import QuizForm from "./quiz-form";

export default async function Page({
  params,
}: {
  params: Promise<{ roadmapId: string }>;
}) {
  const { roadmapId } = await params;

  const [quiz] = await db
    .select()
    .from(roadmapQuizzes)
    .where(eq(roadmapQuizzes.roadmapId, roadmapId))
    .limit(1);

  if (!quiz) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm">
          <FileQuestion className="h-7 w-7 text-zinc-600" />
        </div>
        <p className="font-semibold text-zinc-300">No quiz available</p>
        <p className="mt-1 text-sm text-zinc-600">
          This roadmap doesn&apos;t have a quiz yet.
        </p>
        <Link
          href={`/dashboard/roadmaps/${roadmapId}`}
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-zinc-700/60 bg-zinc-950/60 px-3 py-1.5 text-sm text-zinc-300 backdrop-blur-sm transition-colors hover:border-zinc-500 hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to roadmap
        </Link>
      </div>
    );
  }

  return (
    <QuizForm
      roadmapId={roadmapId}
      questions={
        quiz.questions as {
          question: string;
          options: string[];
          correctAnswer: string;
        }[]
      }
    />
  );
}
