import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return new Response("Unauthorized", { status: 401 });

  const { text } = await req.json();
  if (!text?.trim()) return new Response("No text", { status: 400 });

  const res = await fetch("https://openrouter.ai/api/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "x-ai/grok-voice-tts-1.0",
      input: text,
      voice: "Leo",
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[hilo/tts]", res.status, err);
    return new Response("TTS failed", { status: 500 });
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
