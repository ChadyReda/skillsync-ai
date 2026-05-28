import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { eq, desc, inArray } from "drizzle-orm";
import { db } from "@/src/index";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { roadmaps } from "@/src/db/schemas/roadmap";
import { roadmapNodes } from "@/src/db/schemas/roadmap-nodes";
import { createRoadmap } from "./actions";
import { Map, ArrowRight, Clock } from "lucide-react";
import { Cube } from "@/components/ui/polyhedron";
import CreateRoadmapForm from "./create-roadmap-form";

export default async function RoadmapsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) return null;

  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, dbUser.id))
    .limit(1);

  const userRoadmaps = await db
    .select()
    .from(roadmaps)
    .where(eq(roadmaps.userId, dbUser.id))
    .orderBy(desc(roadmaps.createdAt));

  const roadmapIds = userRoadmaps.map((r) => r.id);
  const nodeStats: Record<string, { total: number; completed: number }> = {};

  if (roadmapIds.length > 0) {
    const nodes = await db
      .select()
      .from(roadmapNodes)
      .where(inArray(roadmapNodes.roadmapId, roadmapIds));

    for (const node of nodes) {
      if (!nodeStats[node.roadmapId]) {
        nodeStats[node.roadmapId] = { total: 0, completed: 0 };
      }
      nodeStats[node.roadmapId].total++;
      if (node.completed) nodeStats[node.roadmapId].completed++;
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      {/* Header */}
      <div className="pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
          [ 03 ] learning paths
        </p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <Map className="h-5 w-5" />
          Learning Roadmaps
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          AI-generated paths tailored to your goals
        </p>
      </div>

      {/* Create form */}
      <CreateRoadmapForm
        createRoadmap={createRoadmap}
        resumeData={profile?.resumeData ?? null}
        resumeInsights={profile?.resumeInsights ?? null}
      />

      {/* Roadmaps grid */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
            my roadmaps · {userRoadmaps.length}
          </p>
        </div>

        {userRoadmaps.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800/60 py-16 text-center backdrop-blur-sm">
            <Cube className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
            <p className="font-medium text-zinc-400">No roadmaps yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              Generate your first AI learning roadmap above
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {userRoadmaps.map((roadmap) => {
              const stats = nodeStats[roadmap.id] ?? { total: 0, completed: 0 };
              const progress =
                stats.total > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0;
              const isCompleted = stats.total > 0 && progress === 100;

              return (
                <Link
                  key={roadmap.id}
                  href={`/dashboard/roadmaps/${roadmap.id}`}
                  className="group relative flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-5 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50"
                  style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
                >
                  {/* Cyan top shimmer on hover */}
                  <span className="absolute inset-x-0 top-0 h-px rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ background: "linear-gradient(to right, transparent, rgba(6,182,212,0.5) 40%, rgba(6,182,212,0.7) 60%, transparent)" }} />

                  <div className="mb-3 flex items-center justify-between">
                    <span
                      className={[
                        "inline-flex items-center gap-1.5 rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm",
                        isCompleted ? "text-emerald-300" : "text-amber-300",
                      ].join(" ")}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isCompleted ? "bg-emerald-400" : "bg-amber-400"
                        }`}
                        style={isCompleted
                          ? { boxShadow: "0 0 5px rgba(52,211,153,0.7)" }
                          : { boxShadow: "0 0 5px rgba(251,191,36,0.7)" }}
                      />
                      {isCompleted ? "Completed" : "In Progress"}
                    </span>
                    {roadmap.estimatedDuration && (
                      <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                        <Clock className="h-3 w-3" />
                        {roadmap.estimatedDuration}
                      </span>
                    )}
                  </div>

                  <h3 className="mb-1 text-[15px] font-semibold text-white">
                    {roadmap.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-zinc-400">
                    {roadmap.description}
                  </p>

                  {stats.total > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                        <span>
                          {stats.completed}/{stats.total} steps
                        </span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full border border-zinc-800/60 bg-zinc-900/60">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${progress}%`,
                            background: isCompleted
                              ? "linear-gradient(to right, #34d399, #10b981)"
                              : "linear-gradient(to right, #8b5cf6, #06b6d4)",
                            boxShadow: isCompleted
                              ? "0 0 8px rgba(52,211,153,0.4)"
                              : "0 0 8px rgba(6,182,212,0.3)",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <ArrowRight className="absolute right-5 top-5 h-4 w-4 text-zinc-700 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-cyan-400" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
