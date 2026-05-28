"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/src";
import { posts, postSyncs, postComments } from "@/src/db/schemas/posts";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { eq, sql, desc } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";

export async function createPost(formData: FormData) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) throw new Error("Unauthorized");

  const content = formData.get("content") as string;
  if (!content?.trim()) return;

  const imageUrl = (formData.get("imageUrl") as string) || null;

  await db.insert(posts).values({
    userId: dbUser.id,
    content: content.trim(),
    imageUrl: imageUrl || undefined,
  });

  revalidatePath("/dashboard/feed");
}

export async function toggleSync(postId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) throw new Error("Unauthorized");

  const [existing] = await db
    .select()
    .from(postSyncs)
    .where(
      sql`${postSyncs.userId} = ${dbUser.id} and ${postSyncs.postId} = ${postId}`,
    )
    .limit(1);

  if (existing) {
    await db
      .delete(postSyncs)
      .where(
        sql`${postSyncs.userId} = ${dbUser.id} and ${postSyncs.postId} = ${postId}`,
      );
  } else {
    await db.insert(postSyncs).values({ userId: dbUser.id, postId });
  }

  revalidatePath("/dashboard/feed");
}

export async function getComments(postId: string) {
  const rows = await db
    .select({
      id: postComments.id,
      content: postComments.content,
      createdAt: postComments.createdAt,
      authorId: users.id,
      authorName: candidateProfiles.fullName,
      authorImageUrl: users.imageUrl,
      authorEmail: users.email,
    })
    .from(postComments)
    .leftJoin(users, eq(postComments.userId, users.id))
    .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(eq(postComments.postId, postId))
    .orderBy(desc(postComments.createdAt));

  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    createdAt: r.createdAt,
    authorId: r.authorId ?? "",
    authorName: r.authorName || r.authorEmail || "User",
    authorImageUrl: r.authorImageUrl ?? null,
  }));
}

export async function addComment(postId: string, content: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) throw new Error("Unauthorized");

  const trimmed = content.trim();
  if (!trimmed || trimmed.length > 500) return;

  await db.insert(postComments).values({
    postId,
    userId: dbUser.id,
    content: trimmed,
  });

  revalidatePath("/dashboard/feed");
}

export async function deleteComment(commentId: string) {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) throw new Error("Unauthorized");

  await db
    .delete(postComments)
    .where(
      sql`${postComments.id} = ${commentId} and ${postComments.userId} = ${dbUser.id}`,
    );

  revalidatePath("/dashboard/feed");
}
