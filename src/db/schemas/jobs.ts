import { pgTable, uuid, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";

import { users } from "./users";

export const jobs = pgTable("jobs", {
  id: uuid("id").defaultRandom().primaryKey(),

  recruiterId: uuid("recruiter_id")
    .references(() => users.id, {
      onDelete: "cascade",
    })
    .notNull(),

  title: varchar("title", { length: 255 }).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // job | internship
  workMode: varchar("work_mode", { length: 50 }).default("onsite"), // remote | hybrid | onsite
  location: varchar("location", { length: 255 }),
  companyName: varchar("company_name", { length: 255 }),
  description: text("description").notNull(),
  requirements: text("requirements"),
  skills: text("skills").array(),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: varchar("salary_currency", { length: 10 }).default("USD"),

  createdAt: timestamp("created_at").defaultNow(),
});
