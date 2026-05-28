"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src/index";
import { roadmapNodes } from "@/src/db/schemas/roadmap-nodes";
import { eq } from "drizzle-orm";

export async function toggleNode(nodeId: string, completed: boolean) {
  await db
    .update(roadmapNodes)
    .set({ completed })
    .where(eq(roadmapNodes.id, nodeId));

  revalidatePath("/dashboard/roadmaps/[roadmapId]", "page");
}
