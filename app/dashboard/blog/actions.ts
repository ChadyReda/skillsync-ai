"use server";

import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src";
import { blogPosts } from "@/src/db/schemas/blog-posts";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    + "-" + Date.now().toString(36);
}

export async function createBlogPost(formData: FormData) {
  const user = await getCurrentDbUser();
  if (!user || !user.canPost) throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const excerpt = formData.get("excerpt") as string;
  const content = formData.get("content") as string;
  const coverImageUrl = formData.get("coverImageUrl") as string;
  const publish = formData.get("publish") === "true";

  await db.insert(blogPosts).values({
    authorId: user.id,
    title,
    slug: slugify(title),
    excerpt: excerpt || null,
    content,
    coverImageUrl: coverImageUrl || null,
    published: publish,
    publishedAt: publish ? new Date() : null,
  });

  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
}

export async function togglePublish(postId: string, currentlyPublished: boolean) {
  const user = await getCurrentDbUser();
  if (!user || !user.canPost) throw new Error("Unauthorized");

  await db
    .update(blogPosts)
    .set({
      published: !currentlyPublished,
      publishedAt: !currentlyPublished ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(blogPosts.id, postId), eq(blogPosts.authorId, user.id)));

  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
}

export async function deleteBlogPost(postId: string) {
  const user = await getCurrentDbUser();
  if (!user || !user.canPost) throw new Error("Unauthorized");

  await db
    .delete(blogPosts)
    .where(and(eq(blogPosts.id, postId), eq(blogPosts.authorId, user.id)));

  revalidatePath("/blog");
  revalidatePath("/dashboard/blog");
}
