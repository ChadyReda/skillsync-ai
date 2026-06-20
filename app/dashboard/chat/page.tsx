import Link from "next/link";
import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/src/index";
import { conversationMembers, conversations, messages } from "@/src/db/schemas/chat";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { recruiterProfiles } from "@/src/db/schemas/recruiter";
import { and, desc, eq, ne, inArray } from "drizzle-orm";
import { MessageCircle, ArrowRight } from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";

function timeAgo(date: Date | null): string {
  if (!date) return "";
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return new Date(date).toLocaleDateString();
}

export default async function ChatPage() {
  const dbUser = await getCurrentDbUser();
  if (!dbUser) redirect("/");

  // 1. Get all conversation IDs for this user
  const myMemberships = await db
    .select({ conversationId: conversationMembers.conversationId })
    .from(conversationMembers)
    .where(eq(conversationMembers.userId, dbUser.id));

  const conversationIds = myMemberships.map((m) => m.conversationId);

  if (conversationIds.length === 0) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <div className="pb-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">[ 06 ] inbox</p>
          <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
            <MessageCircle className="h-5 w-5" />
            Messages
          </h1>
          <p className="mt-1 text-sm text-zinc-500">0 conversations</p>
        </div>
        <div className="rounded-2xl border border-dashed border-zinc-800/60 py-16 text-center backdrop-blur-sm">
          <MessageCircle className="mx-auto mb-3 h-10 w-10 text-zinc-700" />
          <p className="font-medium text-zinc-400">No conversations yet</p>
          <p className="mt-1 text-sm text-zinc-600">Start chatting from a profile page</p>
        </div>
      </div>
    );
  }

  // 2. Get all OTHER members of those conversations in one query (with profile names)
  const otherMembers = await db
    .select({
      conversationId: conversationMembers.conversationId,
      userId: users.id,
      email: users.email,
      role: users.role,
      imageUrl: users.imageUrl,
      candidateName: candidateProfiles.fullName,
      recruiterName: recruiterProfiles.companyName,
    })
    .from(conversationMembers)
    .innerJoin(users, eq(users.id, conversationMembers.userId))
    .leftJoin(candidateProfiles, eq(candidateProfiles.userId, users.id))
    .leftJoin(recruiterProfiles, eq(recruiterProfiles.userId, users.id))
    .where(
      and(
        inArray(conversationMembers.conversationId, conversationIds),
        ne(conversationMembers.userId, dbUser.id),
      ),
    );

  // 3. Get conversation metadata (createdAt) in one query
  const convMeta = await db
    .select({ id: conversations.id, createdAt: conversations.createdAt })
    .from(conversations)
    .where(inArray(conversations.id, conversationIds))
    .orderBy(desc(conversations.createdAt));

  // 4. Get last message per conversation — one query per conversation (unavoidable without lateral)
  //    but now O(N conv) not O(3N conv)
  const lastMessages = await Promise.all(
    conversationIds.map(async (id) => {
      const [msg] = await db
        .select({ conversationId: messages.conversationId, content: messages.content, messageType: messages.messageType, createdAt: messages.createdAt })
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(desc(messages.createdAt))
        .limit(1);
      return msg ?? { conversationId: id, content: null, messageType: null, createdAt: null };
    }),
  );

  const lastMessageMap = new Map(lastMessages.map((m) => [m.conversationId, m]));
  const otherMemberMap = new Map(otherMembers.map((m) => [m.conversationId, m]));

  const conversationsData = convMeta.map((conv) => {
    const other = otherMemberMap.get(conv.id);
    const displayName = !other
      ? "Unknown"
      : other.role === "candidate"
        ? (other.candidateName ?? other.email)
        : (other.recruiterName ?? other.email);

    return {
      id: conv.id,
      displayName,
      otherImageUrl: other?.imageUrl ?? null,
      otherRole: other?.role ?? null,
      lastMessage: lastMessageMap.get(conv.id),
    };
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
      <div className="pb-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">[ 06 ] inbox</p>
        <h1 className="mt-1 flex items-center gap-2 text-2xl font-bold text-white">
          <MessageCircle className="h-5 w-5" />
          Messages
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {conversationsData.length} conversation{conversationsData.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-3">
        {conversationsData.map((conversation) => (
          <Link
            key={conversation.id}
            href={`/dashboard/chat/${conversation.id}`}
            className="group flex items-center gap-4 rounded-2xl border border-zinc-800/60 bg-zinc-950/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-zinc-700/70 hover:bg-zinc-900/50"
            style={{ boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset" }}
          >
            <UserAvatar
              imageUrl={conversation.otherImageUrl}
              name={conversation.displayName}
              className="h-11 w-11 shrink-0"
            />

            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex items-center justify-between">
                <p className="text-[15px] font-semibold text-white">{conversation.displayName}</p>
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                  {timeAgo(conversation.lastMessage?.createdAt ?? null)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className="truncate text-sm text-zinc-500">
                  {conversation.lastMessage
                    ? conversation.lastMessage.messageType === "image"
                      ? "[Image]"
                      : conversation.lastMessage.messageType === "audio"
                        ? "[Audio]"
                        : (conversation.lastMessage.content ?? "")
                    : "Start a conversation"}
                </p>
                {conversation.otherRole && (
                  <span className="ml-2 shrink-0 rounded-full border border-zinc-800/60 bg-zinc-900/60 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500 backdrop-blur-sm">
                    {conversation.otherRole}
                  </span>
                )}
              </div>
            </div>

            <ArrowRight className="h-4 w-4 shrink-0 text-zinc-700 transition-colors duration-200 group-hover:text-zinc-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}
