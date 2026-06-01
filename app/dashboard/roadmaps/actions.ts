"use server";

import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src/index";

import { users } from "@/src/db/schemas/users";

import { roadmaps } from "@/src/db/schemas/roadmap";

import { roadmapNodes } from "@/src/db/schemas/roadmap-nodes";

import { eq } from "drizzle-orm";

import { generateRoadmap } from "@/lib/roadmaps/generate-roadmap";

import { generateQuiz } from "@/lib/roadmaps/generate-quiz";
import { roadmapQuizzes } from "@/src/db/schemas/roadmap-quizzes";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function createRoadmap(formData: FormData) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  enforceRateLimit({
    key: `${clerkUser.id}:roadmap-generate`,
    ...RATE_LIMITS.ROADMAP_GENERATE,
  });

  const goal = formData.get("goal") as string;

  const resumeData = JSON.parse(formData.get("resumeData") as string);

  const resumeInsights = JSON.parse(formData.get("resumeInsights") as string);

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
  // generate roadmap
  //
  const generated = await generateRoadmap(goal, resumeData, resumeInsights);

  //
  // generate quiz
  //
  const quiz = await generateQuiz(generated);

  //
  // create roadmap
  //
  const [roadmap] = await db
    .insert(roadmaps)
    .values({
      userId: dbUser.id,

      title: generated.title,

      description: generated.description,

      goal,

      estimatedDuration: generated.estimatedDuration,
    })
    .returning();

  //
  // create quiz
  //
  await db.insert(roadmapQuizzes).values({
    roadmapId: roadmap.id,
    questions: quiz.questions,
  });

  console.log("Generated Nodes", generated.nodes);

  //
  // insert nodes
  //
  if (generated.nodes?.length > 0) {
    await db.insert(roadmapNodes).values(
      generated.nodes.map((node: any) => ({
        roadmapId: roadmap.id,

        title: node.title,

        description: node.description,

        order: node.order,
      })),
    );
  }

  revalidatePath("/dashboard/roadmaps");
}
