import { sql } from "drizzle-orm";
import {
  index,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { mdBaseSchema } from "./schema";

export const base_tb_news = mdBaseSchema.table(
  "news",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    summary: text("summary"), // Tóm tắt ngắn gọn
    authorId: uuid("author_id").notNull(), // ID của người tạo bài viết
    isPublished: boolean("is_published").default(false).notNull(), // Trạng thái publish
    publishedAt: timestamp("published_at", { withTimezone: true }), // Thời gian publish
    imageUrl: varchar("image_url", { length: 512 }), // Ảnh đại diện
    tags: varchar("tags", { length: 255 }).array(), // Tags cho bài viết
    viewCount: varchar("view_count", { length: 20 }).default("0").notNull(), // Số lượt xem
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    createdBy: uuid("created_by"),
    updatedBy: uuid("updated_by"),
  },
  (table) => ({
    authorIdx: index("news_author_id_idx").on(table.authorId),
    publishedIdx: index("news_published_idx").on(table.isPublished, table.publishedAt),
    createdAtIdx: index("news_created_at_idx").on(table.createdAt),
  })
);

export type BaseTbNews = typeof base_tb_news.$inferSelect;
export type NewBaseTbNews = typeof base_tb_news.$inferInsert;

