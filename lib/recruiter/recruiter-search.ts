// lib/ai/recruiter-search.ts

import { ai } from "@/lib/ai";

export async function parseRecruiterSearch(query: string) {
  const completion = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",

    response_format: {
      type: "json_object",
    },

    messages: [
      {
        role: "system",

        content: `
Extract recruiter search filters.

Return ONLY valid JSON.

{
  "skills": [],
  "keywords": [],
  "level": "",
  "role": ""
}
`,
      },

      {
        role: "user",

        content: query,
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Failed to parse search");
  }

  return JSON.parse(content);
}
