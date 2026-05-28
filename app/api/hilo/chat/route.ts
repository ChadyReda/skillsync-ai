import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/src/index";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { ai } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return new Response("Unauthorized", { status: 401 });

  const { messages } = await req.json();

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) return new Response("User not found", { status: 404 });

  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, dbUser.id))
    .limit(1);

  const systemPrompt = `You are Hilo, a sharp AI career coach having a live voice conversation. Keep it natural, warm, and concise — spoken not written.

RULES:
- Respond in 2-4 sentences max. Never use bullet points, markdown, or lists.
- Talk like a knowledgeable friend: direct, conversational, no filler phrases.
- Give real, specific advice — not generic tips.
- If you need clarification, ask one focused question.
- Reference the user's actual background when relevant.

USER CONTEXT:
Name: ${clerkUser.firstName ?? "there"} | Role: ${dbUser.role}
Resume: ${JSON.stringify(profile?.resumeData ?? "No resume uploaded yet")}`;

  const completion = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",
    stream: true,
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of completion) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
