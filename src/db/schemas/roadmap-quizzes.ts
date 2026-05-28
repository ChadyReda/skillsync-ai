import { pgTable, uuid, jsonb, timestamp } from "drizzle-orm/pg-core";
import { roadmaps } from "./roadmap";

export const roadmapQuizzes = pgTable("roadmap_quizzes", {
  id: uuid("id").defaultRandom().primaryKey(),

  roadmapId: uuid("roadmap_id")
    .references(() => roadmaps.id, {
      onDelete: "cascade",
    })
    .notNull(),

  questions: jsonb("questions"),

  createdAt: timestamp("created_at").defaultNow(),
});
