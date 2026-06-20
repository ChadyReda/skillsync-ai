import type { Metadata } from "next";
import { db } from "@/src";
import { blogPosts } from "@/src/db/schemas/blog-posts";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User, BookOpen } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [post] = await db
    .select({ title: blogPosts.title, excerpt: blogPosts.excerpt })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  if (!post) return { title: "Not Found — SkillSync" };
  return {
    title: `${post.title} — SkillSync Blog`,
    description: post.excerpt ?? undefined,
    openGraph: { title: post.title, description: post.excerpt ?? undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  const [post] = await db
    .select({
      id: blogPosts.id,
      title: blogPosts.title,
      slug: blogPosts.slug,
      excerpt: blogPosts.excerpt,
      content: blogPosts.content,
      coverImageUrl: blogPosts.coverImageUrl,
      published: blogPosts.published,
      publishedAt: blogPosts.publishedAt,
      authorName: candidateProfiles.fullName,
      authorEmail: users.email,
      authorImageUrl: users.imageUrl,
    })
    .from(blogPosts)
    .innerJoin(users, eq(blogPosts.authorId, users.id))
    .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .where(eq(blogPosts.slug, slug))
    .limit(1);

  if (!post || !post.published) notFound();

  const authorName = post.authorName ?? post.authorEmail.split("@")[0];

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-zinc-800/60 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition-all hover:border-zinc-700 hover:text-zinc-200"
          >
            <ArrowLeft className="h-3 w-3" />
            All articles
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-zinc-500" />
            <span className="text-sm font-semibold tracking-[0.18em] text-white">SKILLSYNC</span>
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12">
        {/* Cover image */}
        {post.coverImageUrl && (
          <div className="mb-8 aspect-[16/7] w-full overflow-hidden rounded-2xl border border-zinc-800/60">
            <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          {post.title}
        </h1>

        {/* Meta */}
        <div className="mb-10 flex items-center gap-4 border-b border-zinc-800/60 pb-8 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {post.authorImageUrl ? (
            <img src={post.authorImageUrl} alt={authorName} className="h-8 w-8 rounded-full border border-zinc-800" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <User className="h-4 w-4 text-zinc-500" />
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-zinc-300">{authorName}</span>
            {post.publishedAt && (
              <span className="flex items-center gap-1 text-zinc-600">
                <Clock className="h-3 w-3" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-300 prose-headings:text-white prose-headings:font-bold prose-a:text-white prose-strong:text-white prose-code:text-zinc-300 prose-pre:bg-zinc-900/80 prose-pre:border prose-pre:border-zinc-800/60 prose-hr:border-zinc-800/60">
          <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.8", color: "#d4d4d8", fontSize: "0.9375rem" }}>
            {post.content}
          </div>
        </div>
      </article>
    </div>
  );
}
