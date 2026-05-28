import { ai } from "@/lib/ai";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const completion = await ai.chat.completions.create({
      model: "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful voice assistant inside a LiveKit call.",
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply = completion.choices[0].message.content;

    console.log("AI:", reply);

    return Response.json({ reply });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "AI failed" }, { status: 500 });
  }
}
