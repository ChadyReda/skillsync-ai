import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

import { roadmaps } from "./roadmap";

export const roadmapNodes = pgTable("roadmap_nodes", {
  id: uuid("id").defaultRandom().primaryKey(),

  roadmapId: uuid("roadmap_id")
    .references(() => roadmaps.id, {
      onDelete: "cascade",
    })
    .notNull(),

  title: text("title").notNull(),

  description: text("description"),

  order: integer("order").notNull(),

  completed: boolean("completed").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});
