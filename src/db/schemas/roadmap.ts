import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const roadmaps = pgTable("roadmaps", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  title: text("title").notNull(),

  description: text("description"),

  goal: text("goal").notNull(),

  estimatedDuration: text("estimated_duration"),

  createdAt: timestamp("created_at").defaultNow(),
});
