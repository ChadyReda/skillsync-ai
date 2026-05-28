import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const recruiterShortlists = pgTable("recruiter_shortlists", {
  id: uuid("id").defaultRandom().primaryKey(),

  recruiterId: uuid("recruiter_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  candidateId: uuid("candidate_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  createdAt: timestamp("created_at").defaultNow(),
});
