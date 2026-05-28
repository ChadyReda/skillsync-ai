import { currentUser } from "@clerk/nextjs/server";

import { db } from "@/src/index";
import { users } from "@/src/db/schemas/users";

import { eq } from "drizzle-orm";

export async function getCurrentDbUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!user) return null;

  // Keep imageUrl in sync with Clerk
  if (clerkUser.imageUrl && clerkUser.imageUrl !== user.imageUrl) {
    await db
      .update(users)
      .set({ imageUrl: clerkUser.imageUrl })
      .where(eq(users.clerkId, clerkUser.id));
    return { ...user, imageUrl: clerkUser.imageUrl };
  }

  return user;
}
