"use client";

import { removeFromShortlist } from "./actions";
import { Trash2 } from "lucide-react";

export default function RemoveButton({
  candidateId,
}: {
  candidateId: string;
}) {
  return (
    <button
      onClick={() => removeFromShortlist(candidateId)}
      className="inline-flex items-center gap-1.5 border border-rose-500/40 bg-rose-500/5 px-3 py-2 text-sm font-medium text-rose-300 transition-colors hover:border-rose-400/60 hover:bg-rose-500/10"
    >
      <Trash2 className="h-3.5 w-3.5" />
      Remove
    </button>
  );
}
