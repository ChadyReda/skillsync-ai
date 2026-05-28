import { getCurrentDbUser } from "@/lib/auth";
import { db } from "@/src";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { posts, postSyncs, postComments } from "@/src/db/schemas/posts";
import { eq, sql, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import { Zap, Flame } from "lucide-react";
import { createPost, toggleSync } from "./actions";
import FeedCompose from "./feed-compose";
import FeedPost from "./feed-post";

export default async function FeedPage() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) redirect("/");

  const trendingPosts = await db
    .select({
      id: posts.id,
      content: posts.content,
      imageUrl: posts.imageUrl,
      createdAt: posts.createdAt,
      authorId: users.id,
      authorEmail: users.email,
      authorRole: users.role,
      authorName: candidateProfiles.fullName,
      authorImageUrl: users.imageUrl,
      syncs: sql<number>`count(distinct ${postSyncs.userId})`.as("syncs"),
      commentCount: sql<number>`count(distinct ${postComments.id})`.as("comment_count"),
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .leftJoin(postSyncs, eq(posts.id, postSyncs.postId))
    .leftJoin(postComments, eq(posts.id, postComments.postId))
    .groupBy(posts.id, users.id, candidateProfiles.fullName)
    .orderBy(desc(sql`count(distinct ${postSyncs.userId})`), desc(posts.createdAt));

  const userSyncs = await db
    .select({ postId: postSyncs.postId })
    .from(postSyncs)
    .where(eq(postSyncs.userId, dbUser.id));

  const syncedPostIds = new Set(userSyncs.map((s) => s.postId));

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            [ 01 ] community
          </p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
            <Zap className="h-5 w-5" />
            Sync Feed
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Share ideas, connect with the community
          </p>
        </div>
        <div
          className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-amber-300 backdrop-blur-sm"
          style={{ boxShadow: "0 0 12px rgba(245,158,11,0.15)" }}
        >
          <Flame className="h-3 w-3" />
          Trending
        </div>
      </div>

      {/* Compose */}
      <FeedCompose createPost={createPost} />

      {/* Posts */}
      <div className="space-y-3">
        {trendingPosts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800/60 px-6 py-16 text-center backdrop-blur-sm">
            <Zap className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
            <p className="font-medium text-zinc-400">No posts yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              Be the first to share something.
            </p>
          </div>
        ) : (
          trendingPosts.map((post, index) => (
            <FeedPost
              key={post.id}
              post={{
                id: post.id,
                content: post.content,
                imageUrl: post.imageUrl,
                createdAt: post.createdAt,
                authorId: post.authorId ?? "",
                authorName: post.authorName || post.authorEmail || "User",
                authorImageUrl: post.authorImageUrl,
                authorRole: (post.authorRole ?? "candidate") as "candidate" | "recruiter" | "mentor",
                syncs: Number(post.syncs),
                commentCount: Number(post.commentCount),
                isSynced: syncedPostIds.has(post.id),
                isTrending: index < 3 && Number(post.syncs) > 0,
                currentUserId: dbUser.id,
              }}
              toggleSync={toggleSync}
            />
          ))
        )}
      </div>
    </div>
  );
}
