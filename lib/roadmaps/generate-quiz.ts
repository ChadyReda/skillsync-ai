import { ai } from "@/lib/ai";

export async function generateQuiz(roadmap: any) {
  const completion = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",

    response_format: {
      type: "json_object",
    },

    messages: [
      {
        role: "system",

        content: `
Generate a multiple choice quiz
based ONLY on the roadmap.

Return ONLY valid JSON.

{
  "questions": [
    {
      "question": "",

      "options": [
        "",
        "",
        "",
        ""
      ],

      "correctAnswer": ""
    }
  ]
}

Rules:
- Generate exactly 10 questions
- Each question must have exactly 4 options
- Only ONE correct answer
- Questions should match roadmap topics
- Beginner friendly
`,
      },

      {
        role: "user",

        content: JSON.stringify(roadmap),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Failed to generate quiz");
  }

  return JSON.parse(content);
}
