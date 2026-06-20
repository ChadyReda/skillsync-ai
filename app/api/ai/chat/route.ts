import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

import { db } from "@/src/index";
import { users } from "@/src/db/schemas/users";
import { candidateProfiles } from "@/src/db/schemas/candidate";
import { ai } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkUser.id))
    .limit(1);

  if (!dbUser) {
    return new Response("User not found", { status: 404 });
  }

  const [profile] = await db
    .select()
    .from(candidateProfiles)
    .where(eq(candidateProfiles.userId, dbUser.id))
    .limit(1);

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

  const completion = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",
    stream: true,
    stream_options: { include_usage: true },
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

  // transfer strings into raw bytes [ to send them over the network ]
  const encoder = new TextEncoder();

  // build the stream to send it to the browser
  // the start function describes how data get pushed into the pipe
  // the controller is the one that handle pushing the data in or closing the stream
  const stream = new ReadableStream({
    async start(controller) {
      // for await is the syntax for looping over an async iterator [ completion ]. it waits for each element

      for await (const chunk of completion) {
        const content = chunk.choices?.[0]?.delta?.content;
        if (content) {
          controller.enqueue(
            /*
            The format data: ...\n\n is called
            Server-Sent Events (SSE) — it's a standard text protocol browsers know how to read. Every message starts with data: and ends
            with two newlines.
            */
            encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`),
          );
        }
      }

      //When the AI finishes, we send the special [DONE] message to close the stream
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
