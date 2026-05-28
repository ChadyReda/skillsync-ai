import { extractText } from "unpdf";

export async function extractResumeText(fileBuffer: Buffer) {
  const uint8Array = new Uint8Array(fileBuffer);

  const result = await extractText(uint8Array);

  return result.text[0];
}
