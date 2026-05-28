import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export type MessageType = "text" | "image" | "audio";

export interface DbMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  messageType: MessageType;
  fileUrl: string | null;
  createdAt: Date;
  senderEmail: string;
}

export async function getDbUserByClerkId(
  clerkId: string
): Promise<{ id: string; email: string } | null> {
  const result = await pool.query(
    'SELECT id, email FROM users WHERE clerk_id = $1 LIMIT 1',
    [clerkId]
  );
  return result.rows[0] ?? null;
}

export async function isConversationMember(
  userId: string,
  conversationId: string
): Promise<boolean> {
  const result = await pool.query(
    'SELECT 1 FROM conversation_members WHERE user_id = $1 AND conversation_id = $2 LIMIT 1',
    [userId, conversationId]
  );
  return result.rowCount !== null && result.rowCount > 0;
}

export async function insertMessage(
  conversationId: string,
  senderId: string,
  content: string | null,
  messageType: MessageType,
  fileUrl: string | null,
  senderEmail: string
): Promise<DbMessage> {
  const result = await pool.query(
    `INSERT INTO messages (conversation_id, sender_id, content, message_type, file_url)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, conversation_id, sender_id, content, message_type, file_url, created_at`,
    [conversationId, senderId, content, messageType, fileUrl]
  );
  const row = result.rows[0];
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    messageType: row.message_type,
    fileUrl: row.file_url,
    createdAt: row.created_at,
    senderEmail,
  };
}
