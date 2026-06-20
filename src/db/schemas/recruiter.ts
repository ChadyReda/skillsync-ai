import { uuid, text, pgTable, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const recruiterProfiles = pgTable("recruiter_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  companyName: text("company_name"),

  position: text("position"),

  companyWebsite: text("company_website"),

  companyEmail: text("company_email"),

  companyEmailVerified: boolean("company_email_verified").default(false).notNull(),
});
