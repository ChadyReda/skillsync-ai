import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  clerkId: text("clerk_id").notNull().unique(),

  email: text("email").notNull(),

  imageUrl: text("image_url"),

  role: text("role", {
    enum: ["candidate", "recruiter", "mentor"],
  }).notNull(),

  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
