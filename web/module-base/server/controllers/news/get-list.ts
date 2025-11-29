import { desc, eq, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import { table_news, table_user } from "../../schemas";
import getDbConnect from "../../utils/getDbConnect";
import { JSONResponse } from "../../utils/JSONResponse";

/**
 * GET /api/base/news
 * Get list of published news with pagination
 * Query params: limit (default: 12), offset (default: 0)
 * Ordered by: publishedAt (if exists) or createdAt (newest first)
 */
export async function GET(request: NextRequest) {
  try {
    const db = getDbConnect();
    const { searchParams } = new URL(request.url);
    
    // Parse pagination params
    const limit = Math.min(parseInt(searchParams.get("limit") || "12", 10), 50); // Max 50 per page
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    // Get total count for pagination
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(table_news)
      .where(eq(table_news.isPublished, true));
    
    const total = Number(totalResult?.count || 0);

    // Get published news ordered by published date (newest first)
    // Use COALESCE to prioritize publishedAt, fallback to createdAt
    const newsList = await db
      .select({
        id: table_news.id,
        title: table_news.title,
        content: table_news.content,
        summary: table_news.summary,
        authorId: table_news.authorId,
        isPublished: table_news.isPublished,
        publishedAt: table_news.publishedAt,
        imageUrl: table_news.imageUrl,
        tags: table_news.tags,
        viewCount: table_news.viewCount,
        createdAt: table_news.createdAt,
        authorFirstName: table_user.firstName,
        authorLastName: table_user.lastName,
      })
      .from(table_news)
      .leftJoin(table_user, eq(table_news.authorId, table_user.id))
      .where(eq(table_news.isPublished, true))
      .orderBy(
        desc(sql`COALESCE(${table_news.publishedAt}, ${table_news.createdAt})`)
      )
      .limit(limit)
      .offset(offset);

    // Format response
    const formattedNews = newsList.map((item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      summary: item.summary,
      authorId: item.authorId,
      authorName:
        item.authorFirstName && item.authorLastName
          ? `${item.authorFirstName} ${item.authorLastName}`
          : item.authorFirstName || item.authorLastName || undefined,
      isPublished: item.isPublished,
      publishedAt: item.publishedAt?.toISOString(),
      imageUrl: item.imageUrl,
      tags: item.tags,
      viewCount: item.viewCount,
      createdAt: item.createdAt.toISOString(),
    }));

    return JSONResponse({
      data: formattedNews,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return JSONResponse({
      error: "Failed to fetch news",
      message: error instanceof Error ? error.message : "Unknown error",
      status: 500,
    });
  }
}
