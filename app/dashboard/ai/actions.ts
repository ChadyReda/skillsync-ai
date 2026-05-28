"use server";

import { db } from "@/src/index";
import { aiConversations, aiMessages } from "@/src/db/schemas/ai-conversations";
import { getCurrentDbUser } from "@/lib/auth";
import { eq, and, asc, desc } from "drizzle-orm";

function titleFromMessage(content: string) {
  return content.slice(0, 60).trim() + (content.length > 60 ? "…" : "");
}

export async function createConversation(firstMessage: string) {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");

  const [conv] = await db
    .insert(aiConversations)
    .values({
      userId: user.id,
      title: titleFromMessage(firstMessage),
    })
    .returning();

  return conv;
}

export async function getConversations() {
  const user = await getCurrentDbUser();
  if (!user) return [];

  return db
    .select()
    .from(aiConversations)
    .where(eq(aiConversations.userId, user.id))
    .orderBy(desc(aiConversations.updatedAt));
}

export async function getConversationWithMessages(id: string) {
  const user = await getCurrentDbUser();
  if (!user) return null;

  const [conv] = await db
    .select()
    .from(aiConversations)
    .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, user.id)))
    .limit(1);

  if (!conv) return null;

  const msgs = await db
    .select()
    .from(aiMessages)
    .where(eq(aiMessages.conversationId, id))
    .orderBy(asc(aiMessages.createdAt));

  return { conversation: conv, messages: msgs };
}

export async function saveMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
) {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");

  // bump updatedAt on the conversation
  await db
    .update(aiConversations)
    .set({ updatedAt: new Date() })
    .where(and(eq(aiConversations.id, conversationId), eq(aiConversations.userId, user.id)));

  const [msg] = await db
    .insert(aiMessages)
    .values({ conversationId, role, content })
    .returning();

  return msg;
}

export async function deleteConversation(id: string) {
  const user = await getCurrentDbUser();
  if (!user) throw new Error("Unauthorized");

  await db
    .delete(aiConversations)
    .where(and(eq(aiConversations.id, id), eq(aiConversations.userId, user.id)));
}
