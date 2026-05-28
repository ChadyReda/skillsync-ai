"use server";

import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src/index";

import { conversations, conversationMembers } from "@/src/db/schemas/chat";

import { inArray } from "drizzle-orm";
import { getCurrentDbUser } from "@/lib/auth";

export async function createOrGetConversation(targetUserId: string) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    throw new Error("Unauthorized");
  }

  const currentUserDb = await getCurrentDbUser();

  if (!currentUserDb) {
    throw new Error("User not found");
  }

  //
  // find existing conversation
  //

  const existingMembers = await db
    .select()
    .from(conversationMembers)
    .where(
      inArray(conversationMembers.userId, [currentUserDb.id, targetUserId]),
    );

  const grouped = new Map<string, string[]>();

  for (const item of existingMembers) {
    if (!grouped.has(item.conversationId)) {
      grouped.set(item.conversationId, []);
    }

    grouped.get(item.conversationId)?.push(item.userId);
  }

  for (const [conversationId, members] of grouped) {
    const unique = [...new Set(members)];

    if (
      unique.length === 2 &&
      unique.includes(currentUserDb.id) &&
      unique.includes(targetUserId)
    ) {
      return conversationId;
    }
  }

  //
  // create conversation
  //

  const [conversation] = await db.insert(conversations).values({}).returning();

  await db.insert(conversationMembers).values([
    {
      conversationId: conversation.id,
      userId: currentUserDb.id,
    },
    {
      conversationId: conversation.id,
      userId: targetUserId,
    },
  ]);

  return conversation.id;
}
