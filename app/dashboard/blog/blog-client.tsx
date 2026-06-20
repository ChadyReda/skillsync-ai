"use client";

import { useState, useTransition } from "react";
import { createBlogPost, togglePublish, deleteBlogPost } from "./actions";
import {
  BookOpen,
  Plus,
  Trash2,
  Loader2,
  X,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

export function BlogClient({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [showForm, setShowForm] = useState(false);
  const [creating, startCreate] = useTransition();
  const [toggling, startToggle] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishOnCreate, setPublishOnCreate] = useState(false);

  const handleCreate = (formData: FormData) => {
    formData.set("publish", publishOnCreate ? "true" : "false");
    startCreate(async () => {
      await createBlogPost(formData);
      setShowForm(false);
      setPublishOnCreate(false);
      window.location.reload();
    });
  };

  const handleToggle = (postId: string, currentlyPublished: boolean) => {
    startToggle(async () => {
      await togglePublish(postId, currentlyPublished);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, published: !currentlyPublished, publishedAt: !currentlyPublished ? new Date() : null }
            : p,
        ),
      );
    });
  };

  const handleDelete = (postId: string) => {
    setDeletingId(postId);
    startDelete(async () => {
      await deleteBlogPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDeletingId(null);
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between pb-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            [ 02 ] editorial
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
            <BookOpen className="h-5 w-5" />
            Blog
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {posts.length} article{posts.length !== 1 ? "s" : ""}
            {" · "}
            <Link href="/blog" target="_blank" className="text-zinc-400 underline underline-offset-2 hover:text-white">
              View public blog ↗
            </Link>
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100"
          style={{ boxShadow: "0 0 14px rgba(255,255,255,0.08)" }}
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "New Article"}
        </button>
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="space-y-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-6 backdrop-blur-sm"
          style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
        >
          <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">New article</h2>

          <Field label="Title *">
            <input name="title" required placeholder="e.g. How to land your first AI job" className={inputCls} />
          </Field>

          <Field label="Excerpt">
            <input name="excerpt" placeholder="Short description shown on the blog index" className={inputCls} />
          </Field>

          <Field label="Cover Image URL">
            <input name="coverImageUrl" type="url" placeholder="https://..." className={inputCls} />
          </Field>

          <Field label="Content *">
            <textarea
              name="content"
              required
              rows={12}
              placeholder="Write your article here..."
              className={`${inputCls} resize-none font-mono text-sm`}
            />
          </Field>

          <div className="flex items-center justify-between">
            <label className="flex cursor-pointer items-center gap-2.5">
              <div
                onClick={() => setPublishOnCreate((v) => !v)}
                className={[
                  "relative h-5 w-9 rounded-full border transition-colors",
                  publishOnCreate
                    ? "border-white/30 bg-white"
                    : "border-zinc-700 bg-zinc-900",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-0.5 h-4 w-4 rounded-full transition-transform",
                    publishOnCreate ? "translate-x-4 bg-black" : "translate-x-0.5 bg-zinc-600",
                  ].join(" ")}
                />
              </div>
              <span className="text-sm text-zinc-400">Publish immediately</span>
            </label>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white px-5 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100 disabled:opacity-50"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {publishOnCreate ? "Publish" : "Save Draft"}
            </button>
          </div>
        </form>
      )}

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-800/60 py-16 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
          <p className="font-medium text-zinc-400">No articles yet</p>
          <p className="mt-1 text-sm text-zinc-600">Write your first article above</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50 sm:flex-row sm:items-start"
              style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="text-[15px] font-semibold text-white">{post.title}</h3>
                  <span
                    className={[
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider",
                      post.published
                        ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300"
                        : "border-zinc-700/50 bg-zinc-900/60 text-zinc-500",
                    ].join(" ")}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${post.published ? "bg-emerald-400" : "bg-zinc-600"}`} />
                    {post.published ? "Published" : "Draft"}
                  </span>
                </div>
                {post.excerpt && (
                  <p className="mb-2 text-sm leading-relaxed text-zinc-500">{post.excerpt}</p>
                )}
                <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                  <Clock className="h-3 w-3" />
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : `Draft · ${new Date(post.createdAt).toLocaleDateString()}`}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {post.published && (
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500/60 hover:text-white"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View
                  </Link>
                )}
                <button
                  onClick={() => handleToggle(post.id, post.published)}
                  disabled={toggling}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700/60 bg-zinc-900/60 px-3 py-2 text-sm font-medium text-zinc-300 backdrop-blur-sm transition-all hover:border-zinc-500/60 hover:text-white disabled:opacity-50"
                >
                  {toggling ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : post.published ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  {post.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting && deletingId === post.id}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/[0.06] px-3 py-2 text-sm font-medium text-rose-300 backdrop-blur-sm transition-all hover:border-rose-400/60 hover:bg-rose-500/10 disabled:opacity-50"
                >
                  {deleting && deletingId === post.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none";
