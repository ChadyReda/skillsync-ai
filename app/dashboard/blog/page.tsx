import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src";
import { blogPosts } from "@/src/db/schemas/blog-posts";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";
import { BlogClient } from "./blog-client";

export default async function DashboardBlogPage() {
  const user = await getCurrentDbUser();
  if (!user) redirect("/");

  if (!user.canPost) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 mx-auto items-center justify-center rounded-2xl border border-zinc-800/60 bg-zinc-900/60">
          <Lock className="h-6 w-6 text-zinc-500" />
        </div>
        <h1 className="text-xl font-bold text-white">Access Restricted</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Only approved authors can publish to the SkillSync blog. Contact us to request access.
        </p>
      </div>
    );
  }

  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      published: blogPosts.published,
      publishedAt: blogPosts.publishedAt,
      createdAt: blogPosts.createdAt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.authorId, user.id))
    .orderBy(desc(blogPosts.createdAt));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <BlogClient initialPosts={posts} />
    </div>
  );
}
