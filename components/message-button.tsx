"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrGetConversation } from "@/app/dashboard/actions";
import { MessageCircle, Loader2 } from "lucide-react";

export default function MessageButton({ userId }: { userId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const conversationId = await createOrGetConversation(userId);
          router.push(`/dashboard/chat/${conversationId}`);
        });
      }}
      className="inline-flex items-center gap-2 border border-white bg-white px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-black transition-colors hover:bg-zinc-100 disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <MessageCircle className="h-3.5 w-3.5" />
      )}
      Message
    </button>
  );
}
