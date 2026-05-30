import { pgTable, uuid, varchar, text, timestamp, unique } from "drizzle-orm/pg-core";

import { users } from "./users";
import { jobs } from "./jobs";

export const jobWatchlist = pgTable(
  "job_watchlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    candidateId: uuid("candidate_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    jobId: uuid("job_id")
      .references(() => jobs.id, { onDelete: "cascade" })
      .notNull(),

    // watchlisted | applied | interviewing | offered | rejected
    status: varchar("status", { length: 50 }).default("watchlisted").notNull(),

    notes: text("notes"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [unique("job_watchlist_candidate_job").on(table.candidateId, table.jobId)],
);
