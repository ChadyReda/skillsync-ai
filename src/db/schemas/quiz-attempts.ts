import {
  pgTable,
  uuid,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { roadmaps } from "./roadmap";

export const quizAttempts = pgTable("quiz_attempts", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  roadmapId: uuid("roadmap_id")
    .references(() => roadmaps.id, {
      onDelete: "cascade",
    })
    .notNull(),

  score: integer("score").notNull(),

  passed: boolean("passed"),

  createdAt: timestamp("created_at").defaultNow(),
});
