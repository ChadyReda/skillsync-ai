import { ai } from "@/lib/ai";

export async function analyzeResume(resumeText: string) {
  const completion = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",

    messages: [
      {
        role: "system",

        content: `
    Analyze this resume Text.

    The Score is a number between 0 and 100.

    Be realistic, dont make things up.

    Return ONLY valid JSON.

    Structure:

    {
      "score": 0,
      "summary": "",

      "strengths": [],

      "weaknesses": [],

      "improvements": [],

      "atsIssues": [],

      "recommendedRoles": []
    }
`,
      },

      {
        role: "user",

        content: resumeText,
      },
    ],

    response_format: {
      type: "json_object",
    },
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Failed resume analysis");
  }

  return JSON.parse(content);
}
