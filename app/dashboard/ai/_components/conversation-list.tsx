"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Plus, Trash2, MessageSquare, PanelLeftClose } from "lucide-react";
import { deleteConversation } from "../actions";

type Conversation = {
  id: string;
  title: string;
  updatedAt: Date;
};

interface Props {
  conversations: Conversation[];
  onNewChat: () => void;
  onCollapse: () => void;
}

export function ConversationList({ conversations, onNewChat, onCollapse }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingId(id);
    startTransition(async () => {
      await deleteConversation(id);
      if (pathname === `/dashboard/ai/${id}`) {
        router.push("/dashboard/ai");
      }
      router.refresh();
      setDeletingId(null);
    });
  };

  return (
    <div className="flex h-full w-60 shrink-0 flex-col border-r border-zinc-800/60 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3">
        <span className="text-xs font-semibold text-zinc-400">Conversations</span>
        <div className="flex items-center gap-1">
          <button
            onClick={onNewChat}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
            title="New conversation"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-white"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <MessageSquare className="h-5 w-5 text-zinc-700" />
            <p className="text-xs text-zinc-600">No conversations yet</p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((conv) => {
              const isActive = pathname === `/dashboard/ai/${conv.id}`;
              const isDeleting = deletingId === conv.id;
              return (
                <li key={conv.id}>
                  <Link
                    href={`/dashboard/ai/${conv.id}`}
                    className={[
                      "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200",
                      isDeleting ? "opacity-40 pointer-events-none" : "",
                    ].join(" ")}
                  >
                    <span className="flex-1 truncate text-[13px]">{conv.title}</span>
                    <button
                      onClick={(e) => handleDelete(e, conv.id)}
                      disabled={pending}
                      className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
