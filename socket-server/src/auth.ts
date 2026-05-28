import { verifyToken } from "@clerk/backend";
import dotenv from "dotenv";

dotenv.config();

export async function verifyClerkToken(token: string): Promise<string> {
  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY!,
  });
  return payload.sub;
}
