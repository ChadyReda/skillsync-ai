"use server";

import { currentUser } from "@clerk/nextjs/server";

import { eq, and } from "drizzle-orm";

import { db } from "@/src/index";

import { users } from "@/src/db/schemas/users";

import { roadmapQuizzes } from "@/src/db/schemas/roadmap-quizzes";

import { quizAttempts } from "@/src/db/schemas/quiz-attempts";

import { addXp } from "@/lib/xp/add-xp";

export async function submitQuiz({
  roadmapId,

  answers,
}: {
  roadmapId: string;

  answers: Record<string, string>;
}) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  //
  // db user
  //

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    throw new Error("User not found");
  }

  //
  // prevent xp farming
  //

  //
  // prevent xp farming
  //

  const existingPassedAttempt = await db
    .select()
    .from(quizAttempts)
    .where(
      and(
        eq(quizAttempts.userId, dbUser.id),

        eq(quizAttempts.roadmapId, roadmapId),

        eq(quizAttempts.passed, true),
      ),
    )
    .limit(1);

  if (existingPassedAttempt.length > 0) {
    return {
      score: 100,

      passed: true,

      alreadyPassed: true,
    };
  }

  //
  // quiz
  //

  const [quiz] = await db
    .select()
    .from(roadmapQuizzes)
    .where(eq(roadmapQuizzes.roadmapId, roadmapId))
    .limit(1);

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const questions = quiz.questions as any[];

  //
  // calculate score
  //

  let correct = 0;

  questions.forEach((question, index) => {
    if (answers[index] === question.correctAnswer) {
      correct++;
    }
  });

  const score = Math.round((correct / questions.length) * 100);

  const passed = score >= 70;

  //
  // save attempt
  //

  await db.insert(quizAttempts).values({
    userId: dbUser.id,

    roadmapId,

    score,

    passed,
  });

  //
  // reward xp
  //

  if (passed) {
    await addXp(dbUser.id, 250);
  }

  return {
    score,

    passed,
  };
}
