import { NextRequest } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const clerkUser = await currentUser();
  if (!clerkUser) return new Response("Unauthorized", { status: 401 });

  const formData = await req.formData();
  const audio = formData.get("audio") as Blob | null;
  const prompt = formData.get("prompt") as string | null;

  if (!audio) return new Response("No audio", { status: 400 });

  const form = new FormData();
  form.append("file", audio, "recording.webm");
  form.append("model", "whisper-large-v3");
  form.append("response_format", "json");
  form.append("language", "en");
  // Passing the last AI reply as prompt dramatically improves accuracy
  // by giving Whisper lexical context for the conversation topic.
  if (prompt?.trim()) form.append("prompt", prompt.trim());

  const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[hilo/stt]", res.status, err);
    return new Response(`STT failed: ${err}`, { status: 500 });
  }

  const data = await res.json();
  return Response.json({ transcript: data.text ?? "" });
}
