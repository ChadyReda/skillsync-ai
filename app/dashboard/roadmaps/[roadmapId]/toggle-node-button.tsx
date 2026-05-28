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
        "group w-full border p-5 text-left transition-colors",
        completed
          ? "border-zinc-800 bg-zinc-950"
          : "border-zinc-800 bg-black hover:border-zinc-600 hover:bg-zinc-950",
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="mt-0.5 shrink-0">
          {pending ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          ) : completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
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

        <span className="shrink-0 border border-zinc-800 bg-zinc-950 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {String(node.order).padStart(2, "0")}
        </span>
      </div>
    </button>
  );
}
