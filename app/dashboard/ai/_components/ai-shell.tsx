"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PanelLeftOpen } from "lucide-react";
import { ConversationList } from "./conversation-list";

type Conversation = { id: string; title: string; updatedAt: Date };

interface Props {
  conversations: Conversation[];
  children: React.ReactNode;
}

export function AIShell({ conversations, children }: Props) {
  const router = useRouter();
  const [chatKey, setChatKey] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth >= 1024) setOpen(true);
  }, []);

  const handleNewChat = () => {
    setChatKey((k) => k + 1);
    router.push("/dashboard/ai");
  };

  return (
    <div className="relative flex h-full overflow-hidden">
      {/* Mobile backdrop */}
      {open && (
        <div
          className="absolute inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar
          Mobile: absolute overlay, slides in/out via translate
          Desktop: relative in flex flow, collapses via width */}
      <div
        className={[
          // Mobile base: always absolute overlay
          "absolute inset-y-0 left-0 z-30 w-60 border-r border-zinc-800/60 bg-zinc-950 transition-all duration-300 ease-in-out",
          // Desktop: switch to relative flow
          "lg:relative lg:inset-auto lg:z-auto lg:shrink-0 lg:!translate-x-0",
          // Mobile slide
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop width collapse
          open ? "lg:w-60" : "lg:w-0 lg:overflow-hidden lg:border-r-0",
        ].join(" ")}
      >
        <div className="flex h-full w-60 flex-col">
          <ConversationList
            conversations={conversations}
            onNewChat={handleNewChat}
            onCollapse={() => setOpen(false)}
          />
        </div>
      </div>

      {/* Chat area — never shrinks on mobile */}
      <div key={chatKey} className="relative flex-1 overflow-hidden">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-white"
            title="Open sidebar"
          >
            <PanelLeftOpen className="h-3.5 w-3.5" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
