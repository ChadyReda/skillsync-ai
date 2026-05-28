import { ai } from "@/lib/ai";

export async function parseResume(resumeText: string) {
  const completion = await ai.chat.completions.create({
    model: "openai/gpt-4.1-mini",

    messages: [
      {
        role: "system",

        content: `
Extract structured resume data.

Return ONLY valid JSON.

Structure:

{
  "name": "",
  "email": "",
  "phone": "",
  "location": "",
  "summary": "",

  "education": [
    {
      "school": "",
      "degree": "",
      "gpa": "",
      "date": "",
      "descriptions": []
    }
  ],

  "workExperience": [
    {
      "company": "",
      "jobTitle": "",
      "date": "",
      "descriptions": []
    }
  ],

  "skills": []
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
    throw new Error("Failed to parse resume");
  }

  return JSON.parse(content);
}
