import {
  uuid,
  text,
  integer,
  pgTable,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  fullName: text("full_name"),

  bio: text("bio"),

  skills: text("skills").array(),

  resumeUrl: text("resume_url"),

  resumeText: text("resume_text"),

  resumeData: jsonb("resume_data"),

  resumeScore: integer("resume_score"),

  resumeInsights: jsonb("resume_insights"),

  resumeLastAnalyzedAt: timestamp("resume_last_analyzed_at"),

  xp: integer("xp").default(0),

  level: integer("level").default(1),

  yearsExperience: integer("years_experience"),

  githubUsername: text("github_username"),

  githubData: jsonb("github_data"),

  githubInsights: jsonb("github_insights"),

  githubLastUpdatedAt: timestamp("github_last_updated_at"),
});
