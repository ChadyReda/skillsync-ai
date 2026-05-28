import { pgTable, uuid, timestamp, varchar } from "drizzle-orm/pg-core";

import { users } from "./users";

import { jobs } from "./jobs";

export const jobApplications = pgTable("job_applications", {
  id: uuid("id").defaultRandom().primaryKey(),

  jobId: uuid("job_id")
    .references(() => jobs.id, {
      onDelete: "cascade",
    })
    .notNull(),

  candidateId: uuid("candidate_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  resumeUrl: varchar("resume_url", {
    length: 255,
  }),

  status: varchar("status", {
    length: 50,
  }).default("pending"),

  createdAt: timestamp("created_at").defaultNow(),
});
