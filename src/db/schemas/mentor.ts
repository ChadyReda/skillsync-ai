import { uuid, text, pgTable, integer } from "drizzle-orm/pg-core";
import { users } from "./users";

export const mentorProfiles = pgTable("mentor_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  expertise: text("expertise").array(),

  yearsExperience: integer("years_experience"),

  linkedinUrl: text("linkedin_url"),
});
