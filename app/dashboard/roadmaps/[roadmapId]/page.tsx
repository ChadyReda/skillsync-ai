import Link from "next/link";
import { eq, asc } from "drizzle-orm";
import { db } from "@/src/index";
import { roadmaps } from "@/src/db/schemas/roadmap";
import { roadmapNodes } from "@/src/db/schemas/roadmap-nodes";
import ToggleNodeButton from "./toggle-node-button";
import {
  Map,
  Clock,
  Trophy,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Diamond } from "@/components/ui/polyhedron";

export default async function RoadmapDetailPage({
  params,
}: {
  params: Promise<{ roadmapId: string }>;
}) {
  const { roadmapId } = await params;

  const [roadmap] = await db
    .select()
    .from(roadmaps)
    .where(eq(roadmaps.id, roadmapId))
    .limit(1);

  if (!roadmap) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="border border-zinc-800 bg-zinc-950 p-10 text-center">
          <Map className="mx-auto mb-3 h-12 w-12 text-zinc-700" />
          <p className="text-zinc-400">Roadmap not found</p>
          <Link
            href="/dashboard/roadmaps"
            className="mt-4 inline-flex items-center gap-1.5 border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Roadmaps
          </Link>
        </div>
      </div>
    );
  }

  const nodes = await db
    .select()
    .from(roadmapNodes)
    .where(eq(roadmapNodes.roadmapId, roadmapId))
    .orderBy(asc(roadmapNodes.order));

  const completedCount = nodes.filter((n) => n.completed).length;
  const totalCount = nodes.length;
  const progress =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const isCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-8">
      {/* Back */}
      <Link
        href="/dashboard/roadmaps"
        className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-zinc-200"
      >
        <ArrowLeft className="h-3 w-3" />
        All Roadmaps
      </Link>

      {/* Header */}
      <div className="space-y-5 border border-zinc-800 bg-zinc-950 p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex-1">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              learning roadmap
            </p>
            <h1 className="mb-2 text-2xl font-bold text-white">
              {roadmap.title}
            </h1>
            <p className="text-sm leading-relaxed text-zinc-400">
              {roadmap.description}
            </p>
          </div>
          {roadmap.estimatedDuration && (
            <div className="inline-flex shrink-0 items-center gap-1.5 border border-zinc-800 bg-black px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-300">
              <Clock className="h-3 w-3" />
              {roadmap.estimatedDuration}
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2 border-t border-zinc-800 pt-4">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em]">
            <span className="text-zinc-500">progress</span>
            <span className="text-zinc-300">
              {completedCount}/{totalCount} · {progress}%
            </span>
          </div>
          <div className="h-1 overflow-hidden border border-zinc-800 bg-black">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nodes */}
      <div className="space-y-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          Steps · {totalCount}
        </p>
        {nodes.map((node) => (
          <ToggleNodeButton key={node.id} node={node} />
        ))}
      </div>

      {/* Completion CTA */}
      {isCompleted && (
        <div className="space-y-4 border border-emerald-500/40 bg-emerald-500/[0.04] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-emerald-500/40 bg-black">
              <Trophy className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Roadmap Completed
              </h2>
              <p className="mt-0.5 text-sm text-zinc-400">
                You&apos;ve finished all the steps. Ready for the final quiz?
              </p>
            </div>
          </div>
          <Link
            href={`/dashboard/roadmaps/${roadmapId}/quiz`}
            className="inline-flex items-center gap-2 border border-white bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100"
          >
            <Diamond className="h-4 w-4" />
            Take Final Quiz
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
