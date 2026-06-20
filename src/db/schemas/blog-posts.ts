import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { users } from "./users";

export const blogPosts = pgTable("blog_posts", {
  id: uuid("id").defaultRandom().primaryKey(),

  authorId: uuid("author_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),

  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  coverImageUrl: text("cover_image_url"),
  published: boolean("published").default(false).notNull(),

  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
