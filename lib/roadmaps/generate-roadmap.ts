import { ai } from "@/lib/ai";

export async function generateRoadmap(
  goal: string,

  resumeData: any,

  resumeInsights: any,
) {
  const completion = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",

    response_format: {
      type: "json_object",
    },

    messages: [
      {
        role: "system",

        content: `
Generate a learning roadmap.

Return ONLY valid JSON.

{
  "title": "",
  "description": "",
  "estimatedDuration": "",
  "nodes": [
    {
      "title": "",
      "description": "",
      "order": 1
    }
  ]
}
`,
      },

      {
        role: "user",

        content: JSON.stringify({
          goal,

          resumeData,

          resumeInsights,
        }),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Failed to generate roadmap");
  }

  return JSON.parse(content);
}
