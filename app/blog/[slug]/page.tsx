import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, User, BookOpen } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { db } from "@/src";
import { blogPosts } from "@/src/db/schemas/blog-posts";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";

type Props = {
  params: Promise<{ slug: string }>;
};

// ============================================================================
// Metadata Generation
// ============================================================================

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const [post] = await db
    .select({
      title: blogPosts.title,
      excerpt: blogPosts.excerpt,
    })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);

  if (!post) {
    return { title: "Not Found — SkillSync" };
  }

  return {
    title: `${post.title} — SkillSync Blog`,
    description: post.excerpt ?? undefined,
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
    },
  };
}

// ============================================================================
// Markdown Components
// ============================================================================

const markdownComponents = {
  h1: ({ node, ...props }: any) => (
    <h1 className="text-4xl font-bold text-white md:text-5xl" {...props} />
  ),
  h2: ({ node, ...props }: any) => (
    <h2
      className="mt-12 text-2xl font-bold text-white md:text-3xl"
      {...props}
    />
  ),
  h3: ({ node, ...props }: any) => (
    <h3 className="mt-8 text-xl font-bold text-white md:text-2xl" {...props} />
  ),
  p: ({ node, ...props }: any) => (
    <p className="mb-6 text-[15px] leading-[1.8] text-zinc-300" {...props} />
  ),
  a: ({ node, href, children, ...props }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-white underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-zinc-300"
      {...props}
    >
      {children}
    </a>
  ),
  ul: ({ node, ...props }: any) => (
    <ul className="mb-6 space-y-2 text-zinc-300" {...props} />
  ),
  ol: ({ node, ...props }: any) => (
    <ol className="mb-6 space-y-2 text-zinc-300" {...props} />
  ),
  li: ({ node, ...props }: any) => (
    <li
      className="ml-6 list-disc text-[15px] leading-[1.8] text-zinc-300"
      {...props}
    />
  ),
  blockquote: ({ node, ...props }: any) => (
    <blockquote
      className="my-8 border-l-4 border-zinc-700 pl-6 italic text-zinc-400"
      {...props}
    />
  ),
  code: ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || "");

    if (inline) {
      return (
        <code
          className="rounded bg-zinc-800/80 px-1.5 py-0.5 text-sm text-zinc-300"
          {...props}
        >
          {children}
        </code>
      );
    }

    return (
      <pre className="my-6 overflow-x-auto rounded-lg border border-zinc-800/60 bg-zinc-900/80 p-4">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  hr: ({ node, ...props }: any) => (
    <hr className="my-12 border-zinc-800/60" {...props} />
  ),
  img: ({ node, src, alt, ...props }: any) => (
    <img
      src={src}
      alt={alt}
      className="my-8 rounded-lg border border-zinc-800/60"
      {...props}
    />
  ),
};

// ============================================================================
// Page Component
// ============================================================================

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const { userId } = await auth();
  const isSignedIn = !!userId;

  // Fetch blog post with author data
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

  // Handle unpublished or missing posts
  if (!post || !post.published) {
    notFound();
  }

  const authorName = post.authorName ?? post.authorEmail.split("@")[0];

  return (
    <div className="min-h-screen bg-black">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/60 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition-all hover:border-zinc-700 hover:text-zinc-200"
          >
            <ArrowLeft className="h-3 w-3" />
            All articles
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-semibold tracking-[0.18em] text-white">
                SKILLSYNC
              </span>
            </Link>

            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
              >
                Workspace →
              </Link>
            ) : (
              <Link
                href="/sign-in"
                className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-1.5 text-sm font-medium text-zinc-200 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white hover:text-black"
              >
                Sign in →
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ===== Blog Article ===== */}
      <article className="mx-auto max-w-3xl px-4 py-12">
        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="mb-10 aspect-[16/7] w-full overflow-hidden rounded-2xl border border-zinc-800/60">
            <img
              src={post.coverImageUrl}
              alt={post.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* Title */}
        <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
          {post.title}
        </h1>

        {/* Author Meta */}
        <div className="mb-12 flex items-center gap-4 border-b border-zinc-800/60 pb-8 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {post.authorImageUrl ? (
            <img
              src={post.authorImageUrl}
              alt={authorName}
              className="h-10 w-10 rounded-full border border-zinc-800"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900">
              <User className="h-4 w-4 text-zinc-500" />
            </div>
          )}

          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-zinc-300">
              {authorName}
            </span>

            {post.publishedAt && (
              <span className="flex items-center gap-1.5 text-xs text-zinc-500">
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
        <div className="prose prose-invert prose-zinc max-w-none">
          <ReactMarkdown components={markdownComponents}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
