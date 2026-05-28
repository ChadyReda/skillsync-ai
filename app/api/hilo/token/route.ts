import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { AccessToken } from "livekit-server-sdk";

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return new Response("Unauthorized", { status: 401 });

  const { room } = await req.json();
  if (!room) return new Response("room required", { status: 400 });

  const token = new AccessToken(
    process.env.LIVEKIT_API_KEY!,
    process.env.LIVEKIT_API_SECRET!,
    {
      identity: clerkUser.id,
      name: clerkUser.firstName ?? clerkUser.emailAddresses[0]?.emailAddress ?? "User",
      ttl: "1h",
    },
  );

  token.addGrant({
    room,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  });

  return Response.json({ token: await token.toJwt() });
}
