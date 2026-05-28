import { Webhook } from "svix";
import { headers } from "next/headers";

import { db } from "@/src/index";
import { users } from "@/src/db/schemas/users";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET!;

  const payload = await req.text();

  const headerPayload = await headers();

  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id")!,
    "svix-timestamp": headerPayload.get("svix-timestamp")!,
    "svix-signature": headerPayload.get("svix-signature")!,
  };

  const wh = new Webhook(secret);

  let evt: any;

  try {
    evt = wh.verify(payload, svixHeaders);
  } catch (err) {
    return new Response("Invalid webhook", { status: 400 });
  }

  if (evt.type === "user.created") {
    await db.insert(users).values({
      clerkId: evt.data.id,
      email: evt.data.email_addresses[0].email_address,
      // temporary default
      role: "candidate",
    });
  }

  //
  // user deleted
  //

  if (evt.type === "user.deleted") {
    const clerkId = evt.data.id;

    if (!clerkId) {
      return new Response("Missing clerk id", { status: 400 });
    }

    try {
      await db.delete(users).where(eq(users.clerkId, clerkId));
    } catch (err) {
      console.error("Failed to delete user", clerkId, err);
      return new Response("Failed to delete user", { status: 500 });
    }

    return new Response("User deleted", { status: 200 });
  }

  return Response.json({ success: true });
}
