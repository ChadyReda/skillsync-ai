import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/src";
import { blogPosts } from "@/src/db/schemas/blog-posts";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { eq, desc, and } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, ArrowRight, Clock, User } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — SkillSync",
  description: "Career insights, interview tips, and AI-powered job search strategies from SkillSync.",
  openGraph: {
    title: "Blog — SkillSync",
    description: "Career insights, interview tips, and AI-powered job search strategies.",
  },
};

export default async function BlogPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  const posts = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      coverImageUrl: blogPosts.coverImageUrl,
      publishedAt: blogPosts.publishedAt,
      authorName: candidateProfiles.fullName,
      authorEmail: users.email,
    })
    .from(blogPosts)
    .innerJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(and(eq(blogPosts.published, true)))
    .orderBy(desc(blogPosts.publishedAt));

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-900/60">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-semibold tracking-[0.18em] text-white">SKILLSYNC</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/jobs" className="text-sm text-zinc-500 transition-colors hover:text-zinc-200">
              Jobs
            </Link>
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
              >
                Workspace →
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
              >
                Sign in →
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-10 px-4 py-12">
        {/* Hero */}
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-600">insights</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">Career Intelligence</h1>
          <p className="mt-2 text-base text-zinc-400">
            Strategies, insights, and guidance to accelerate your career in the AI era.
          </p>
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-zinc-800/60 py-24 text-center">
            <BookOpen className="mb-4 h-10 w-10 text-zinc-700" />
            <p className="font-medium text-zinc-400">No articles yet</p>
            <p className="mt-1 text-sm text-zinc-600">Check back soon for career insights.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={[
                  "group flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/60 hover:bg-zinc-900/50",
                  i === 0 ? "sm:col-span-2" : "",
                ].join(" ")}
                style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 24px rgba(0,0,0,0.3)" }}
              >
                {post.coverImageUrl && (
                  <div className="aspect-[16/7] w-full overflow-hidden rounded-t-2xl">
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h2 className={["font-bold text-white transition-colors group-hover:text-zinc-100", i === 0 ? "text-xl" : "text-base"].join(" ")}>
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-zinc-500">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.authorName ?? post.authorEmail.split("@")[0]}
                      </span>
                      {post.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.publishedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors group-hover:text-white">
                      Read
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
