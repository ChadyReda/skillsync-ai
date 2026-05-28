import {
  pgTable,
  uuid,
  timestamp,
  text,
  primaryKey,
} from "drizzle-orm/pg-core";

import { users } from "./users";

//
// conversations
//

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

//
// conversation members
//

export const conversationMembers = pgTable(
  "conversation_members",
  {
    conversationId: uuid("conversation_id")
      .references(() => conversations.id, {
        onDelete: "cascade",
      })
      .notNull(),

    userId: uuid("user_id")
      .references(() => users.id, {
        onDelete: "cascade",
      })
      .notNull(),
  },

  (table) => ({
    pk: primaryKey({
      columns: [table.conversationId, table.userId],
    }),
  }),
);

//
// messages
//

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),

  conversationId: uuid("conversation_id")
    .references(() => conversations.id, {
      onDelete: "cascade",
    })
    .notNull(),

  senderId: uuid("sender_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  content: text("content"),

  messageType: text("message_type").notNull().default("text"),

  fileUrl: text("file_url"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
