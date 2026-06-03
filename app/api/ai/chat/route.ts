import { NextRequest } from "next/server";

import { currentUser } from "@clerk/nextjs/server";

import { eq } from "drizzle-orm";

import { db } from "@/src/index";

import { users } from "@/src/db/schemas/users";

import { candidateProfiles } from "@/src/db/schemas/candidate";

import { ai } from "@/lib/ai";
import { checkRateLimit, RATE_LIMITS, checkAIChatTokens, recordAIChatTokens } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rl = checkRateLimit({ key: `${clerkUser.id}:ai-chat`, ...RATE_LIMITS.AI_CHAT });
  if (!rl.ok) {
    return new Response(
      JSON.stringify({ error: `Too many requests. Try again in ${rl.retryAfter}s.` }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rl.retryAfter) } }
    );
  }

  const tokenCheck = checkAIChatTokens(clerkUser.id);

  const { messages } = await req.json();

  //
  // db user
  //

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    return new Response("User not found", {
      status: 404,
    });
  }

  //
  // candidate profile
  //

  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, dbUser.id))
    .limit(1);

  //
  // AI context
  //

  const systemPrompt = `
You are an AI career mentor.

You help users:
- improve careers
- learn skills
- improve resumes
- prepare for jobs

CURRENT USER:
${dbUser}

Role:
${dbUser.role}

Resume Data:
${JSON.stringify(profile?.resumeData || {})}

Resume Insights:
${JSON.stringify(profile?.resumeInsights || {})}


Instructions:
- personalize answers
- use the user's resume context
- give practical advice
- be concise
`;

  //
  // stream
  //

  const completion = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",

    stream: true,

    stream_options: { include_usage: true },

    messages: [
      {
        role: "system",

        content: systemPrompt,
      },

      ...messages,
    ],
  });

  // If already over the token limit, let this response complete but signal the client immediately after
  const alreadyLimited = !tokenCheck.ok;

  const encoder = new TextEncoder();
  const userId = clerkUser.id;

  const stream = new ReadableStream({
    async start(controller) {
      let totalTokens = 0;

      for await (const chunk of completion) {
        if (chunk.usage?.total_tokens) {
          totalTokens = chunk.usage.total_tokens;
        }

        const content = chunk.choices?.[0]?.delta?.content;

        if (content) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
          );
        }
      }

      if (totalTokens > 0) {
        recordAIChatTokens(userId, totalTokens);
      }

      // After the full response is delivered, check if the user has now hit their limit
      const postCheck = checkAIChatTokens(userId);
      if (!postCheck.ok || alreadyLimited) {
        const retryAfter = alreadyLimited ? tokenCheck.retryAfter : postCheck.retryAfter;
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "rate_limited", retryAfter })}\n\n`,
          ),
        );
      }

      controller.enqueue(encoder.encode(`data: [DONE]\n\n`));

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",

      Connection: "keep-alive",

      "Cache-Control": "no-cache",
    },
  });
}
