"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Diamond } from "@/components/ui/polyhedron";

interface CreateRoadmapFormProps {
  createRoadmap: (formData: FormData) => Promise<void>;
  resumeData: unknown;
  resumeInsights: unknown;
}

export default function CreateRoadmapForm({
  createRoadmap,
  resumeData,
  resumeInsights,
}: CreateRoadmapFormProps) {
  const [loading, setLoading] = useState(false);
  const [goal, setGoal] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || loading) return;
    setLoading(true);
    const formData = new FormData();
    formData.set("goal", goal);
    formData.set("resumeData", JSON.stringify(resumeData ?? {}));
    formData.set("resumeInsights", JSON.stringify(resumeInsights ?? {}));
    await createRoadmap(formData);
    setGoal("");
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="overflow-hidden rounded-2xl border border-zinc-800/60 bg-zinc-950/60 backdrop-blur-sm transition-all duration-200 focus-within:border-zinc-700/80"
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.04) inset" }}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800/50 px-4 py-2.5">
        <Diamond className="h-3.5 w-3.5 text-white" />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-400">
          Generate AI Roadmap
        </span>
      </div>
      <div className="flex flex-col gap-0 p-4 sm:flex-row sm:gap-3">
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Become a full-stack developer, Learn machine learning..."
          required
          className="flex-1 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-4 py-3 text-sm text-white placeholder-zinc-600 backdrop-blur-sm transition-all focus:border-zinc-600/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!goal.trim() || loading}
          className="mt-3 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-white/20 bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wider text-black transition-all hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0"
          style={
            goal.trim() && !loading
              ? { boxShadow: "0 0 16px rgba(255,255,255,0.1)" }
              : undefined
          }
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Generate
            </>
          )}
        </button>
      </div>
      {loading && (
        <p className="flex items-center gap-2 border-t border-zinc-800/50 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          AI is building your personalized roadmap...
        </p>
      )}
    </form>
  );
}
