"use client";

import { useState, useTransition } from "react";
import { toggleNode } from "./actions";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface NodeType {
  id: string;
  title: string;
  description: string | null;
  order: number;
  completed: boolean | null;
}

export default function ToggleNodeButton({ node }: { node: NodeType }) {
  const [completed, setCompleted] = useState(node.completed ?? false);
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      setCompleted(!completed);
      await toggleNode(node.id, !completed);
    });
  };

  return (
    <button
      disabled={pending}
      onClick={handleToggle}
      className={[
        "group relative w-full overflow-hidden rounded-2xl border p-5 text-left backdrop-blur-sm transition-all duration-200",
        completed
          ? "border-zinc-800/60 bg-zinc-950/50"
          : "border-zinc-800/60 bg-zinc-950/40 hover:border-zinc-700/70 hover:bg-zinc-900/50",
      ].join(" ")}
      style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
    >
      {/* Top shimmer on hover */}
      {!completed && (
        <span
          className="absolute inset-x-0 top-0 h-px rounded-t-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(139,92,246,0.4) 40%, rgba(6,182,212,0.5) 60%, transparent)",
          }}
        />
      )}

      <div className="flex items-start gap-4">
        <div className="mt-0.5 shrink-0">
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          ) : completed ? (
            <CheckCircle2
              className="h-5 w-5 text-emerald-400"
              style={{ filter: "drop-shadow(0 0 4px rgba(52,211,153,0.5))" }}
            />
          ) : (
            <Circle className="h-5 w-5 text-zinc-600 transition-colors group-hover:text-zinc-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={[
              "text-[15px] font-semibold transition-colors",
              completed ? "text-zinc-500 line-through" : "text-white",
            ].join(" ")}
          >
            {node.title}
          </h3>
          {node.description && (
            <p
              className={[
                "mt-1 text-sm leading-relaxed",
                completed ? "text-zinc-600" : "text-zinc-400",
              ].join(" ")}
            >
              {node.description}
            </p>
          )}
        </div>

        <span className="shrink-0 rounded-lg border border-zinc-800/60 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {String(node.order).padStart(2, "0")}
        </span>
      </div>
    </button>
  );
}
