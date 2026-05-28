"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flame, Loader2, MessageCircle, Send, Trash2, Zap } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { getComments, addComment, deleteComment } from "./actions";

interface Post {
  id: string;
  content: string;
  imageUrl?: string | null;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorImageUrl?: string | null;
  authorRole: "candidate" | "recruiter" | "mentor";
  syncs: number;
  commentCount: number;
  isSynced: boolean;
  isTrending: boolean;
  currentUserId: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  authorImageUrl: string | null;
}

interface FeedPostProps {
  post: Post;
  toggleSync: (postId: string) => Promise<void>;
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

export default function FeedPost({ post, toggleSync }: FeedPostProps) {
  const [synced, setSynced] = useState(post.isSynced);
  const [syncCount, setSyncCount] = useState(post.syncs);
  const [syncLoading, setSyncLoading] = useState(false);

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoaded, setCommentsLoaded] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const commentInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!showComments || commentsLoaded) return;
    setCommentsLoading(true);
    getComments(post.id).then((data) => {
      setComments(data as Comment[]);
      setCommentsLoaded(true);
      setCommentsLoading(false);
    });
  }, [showComments, commentsLoaded, post.id]);

  useEffect(() => {
    if (showComments) {
      setTimeout(() => commentInputRef.current?.focus(), 100);
    }
  }, [showComments]);

  const handleSync = async () => {
    if (syncLoading) return;
    setSyncLoading(true);
    setSynced((prev) => !prev);
    setSyncCount((prev) => (synced ? prev - 1 : prev + 1));
    await toggleSync(post.id);
    setSyncLoading(false);
  };

  const handleToggleComments = () => {
    setShowComments((prev) => !prev);
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    const text = commentText.trim();
    setCommentText("");
    await addComment(post.id, text);
    const fresh = await getComments(post.id);
    setComments(fresh as Comment[]);
    setCommentCount((c) => c + 1);
    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingId(commentId);
    await deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setCommentCount((c) => Math.max(0, c - 1));
    setDeletingId(null);
  };

  return (
    <div
      className="group overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/50 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <UserAvatar
            imageUrl={post.authorImageUrl}
            name={post.authorName}
            className="h-9 w-9"
          />
          <div>
            <Link
              href={
                post.authorRole === "recruiter"
                  ? `/dashboard/recruiter/${post.authorId}`
                  : post.authorRole === "mentor"
                  ? `/dashboard/mentor/${post.authorId}`
                  : `/dashboard/candidates/${post.authorId}`
              }
              className="text-sm font-semibold text-white transition-colors hover:text-zinc-300"
            >
              {post.authorName}
            </Link>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-600">
              {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {post.isTrending && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-amber-300 backdrop-blur-sm"
              style={{ boxShadow: "0 0 10px rgba(245,158,11,0.15)" }}
            >
              <Flame className="h-2.5 w-2.5" />
              Trending
            </span>
          )}
          <span className="rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-500">
            {syncCount} {syncCount === 1 ? "sync" : "syncs"}
          </span>
        </div>
      </div>

      {/* Content */}
      <p className="whitespace-pre-wrap px-5 pb-4 text-[15px] leading-relaxed text-zinc-200">
        {post.content}
      </p>

      {/* Image */}
      {post.imageUrl && (
        <div className="mx-5 mb-4 overflow-hidden rounded-xl border border-zinc-800/60">
          <img
            src={post.imageUrl}
            alt="Post attachment"
            className="max-h-96 w-full object-cover"
          />
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-2 border-t border-zinc-800/40 px-5 py-3">
        <button
          onClick={handleSync}
          disabled={syncLoading}
          className={[
            "inline-flex h-8 items-center gap-2 rounded-full px-4 font-mono text-[11px] uppercase tracking-wider backdrop-blur-sm transition-all duration-200",
            synced
              ? "border border-violet-500/40 bg-violet-500/15 text-violet-300"
              : "border border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500/60 hover:text-zinc-200",
          ].join(" ")}
          style={synced ? { boxShadow: "0 0 16px rgba(139,92,246,0.25)" } : undefined}
        >
          <Zap className={["h-3 w-3", synced ? "fill-violet-300" : ""].join(" ")} />
          {synced ? "Synced" : "Sync"}
        </button>

        <button
          onClick={handleToggleComments}
          className={[
            "inline-flex h-8 items-center gap-2 rounded-full px-4 font-mono text-[11px] uppercase tracking-wider transition-all duration-200",
            showComments
              ? "border border-zinc-600/60 bg-zinc-800/60 text-zinc-300"
              : "border border-zinc-700/60 bg-zinc-900/60 text-zinc-400 hover:border-zinc-500/60 hover:text-zinc-200",
          ].join(" ")}
        >
          <MessageCircle className="h-3 w-3" />
          {commentCount > 0 ? `${commentCount} ${commentCount === 1 ? "comment" : "comments"}` : "Comment"}
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-zinc-800/40 bg-zinc-950/30">
          {/* Comment list */}
          {commentsLoading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
            </div>
          ) : comments.length === 0 ? (
            <p className="px-5 py-5 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-700">
              No comments yet — be the first
            </p>
          ) : (
            <div className="divide-y divide-zinc-800/40">
              {comments.map((comment) => (
                <div key={comment.id} className="group/comment flex gap-3 px-5 py-3.5">
                  <UserAvatar
                    imageUrl={comment.authorImageUrl}
                    name={comment.authorName}
                    className="mt-0.5 h-7 w-7 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <Link
                        href={`/dashboard/candidates/${comment.authorId}`}
                        className="text-xs font-semibold text-zinc-200 transition-colors hover:text-white"
                        prefetch={false}
                      >
                        {comment.authorName}
                      </Link>
                      <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-700">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm leading-relaxed text-zinc-400">
                      {comment.content}
                    </p>
                  </div>
                  {comment.authorId === post.currentUserId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      disabled={deletingId === comment.id}
                      className="mt-1 shrink-0 text-zinc-800 opacity-0 transition-all group-hover/comment:opacity-100 hover:text-rose-400 disabled:opacity-50"
                    >
                      {deletingId === comment.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* New comment input */}
          <div className="flex gap-3 border-t border-zinc-800/40 px-5 py-3.5">
            <div className="flex-1 overflow-hidden rounded-xl border border-zinc-800/60 bg-zinc-900/60 transition-colors focus-within:border-zinc-700/60">
              <textarea
                ref={commentInputRef}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value.slice(0, 500))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
                placeholder="Write a comment…"
                rows={1}
                className="w-full resize-none bg-transparent px-3 py-2.5 text-sm leading-relaxed text-white placeholder-zinc-600 focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddComment}
              disabled={!commentText.trim() || submitting}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center self-end rounded-xl border border-white/20 bg-white text-black transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {submitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
