import { getCurrentDbUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/src/index";
import { conversationMembers, messages } from "@/src/db/schemas/chat";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { recruiterProfiles } from "@/src/db/schemas/recruiter";
import { and, asc, eq, ne } from "drizzle-orm";
import ChatRoom from "@/components/chat-room";

interface PageProps {
  params: Promise<{ conversationId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { conversationId } = await params;

  const dbUser = await getCurrentDbUser();
  if (!dbUser) redirect("/");

  // verify membership
  const [membership] = await db
    .select()
    .from(conversationMembers)
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        eq(conversationMembers.userId, dbUser.id),
      ),
    )
    .limit(1);

  if (!membership) redirect("/dashboard/chat");

  // fetch the other participant
  const [partner] = await db
    .select({ id: users.id, email: users.email, role: users.role, imageUrl: users.imageUrl })
    .from(conversationMembers)
    .innerJoin(users, eq(users.id, conversationMembers.userId))
    .where(
      and(
        eq(conversationMembers.conversationId, conversationId),
        ne(conversationMembers.userId, dbUser.id),
      ),
    )
    .limit(1);

  // resolve partner's display name from their profile
  let partnerName = partner?.email ?? "Unknown";
  if (partner?.role === "candidate") {
    const [p] = await db
      .select({ fullName: candidateProfiles.fullName })
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, partner.id))
      .limit(1);
    if (p?.fullName) partnerName = p.fullName;
  } else if (partner?.role === "recruiter") {
    const [p] = await db
      .select({ companyName: recruiterProfiles.companyName })
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, partner.id))
      .limit(1);
    if (p?.companyName) partnerName = p.companyName;
  }

  // fetch messages
  const rawMessages = await db
    .select({
      id: messages.id,
      content: messages.content,
      createdAt: messages.createdAt,
      senderId: messages.senderId,
      senderEmail: users.email,
      messageType: messages.messageType,
      fileUrl: messages.fileUrl,
    })
    .from(messages)
    .innerJoin(users, eq(users.id, messages.senderId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt));

  const chatMessages = rawMessages.map((m) => ({
    ...m,
    messageType: m.messageType as "text" | "image" | "audio",
  }));

  return (
    <ChatRoom
      conversationId={conversationId}
      currentUserId={dbUser.id}
      initialMessages={chatMessages}
      partnerName={partnerName}
      partnerRole={partner?.role ?? null}
      partnerImageUrl={partner?.imageUrl ?? null}
    />
  );
}
