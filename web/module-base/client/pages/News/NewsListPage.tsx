"use client";

import newsService from "@base/client/services/NewsService";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Spinner } from "@heroui/spinner";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Calendar, ChevronDown, Eye, User } from "lucide-react";
import Image from "next/image";
import { useMemo } from "react";

const ITEMS_PER_PAGE = 12;

export default function NewsListPage() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: ["news"],
    queryFn: ({ pageParam = 0 }) =>
      newsService.getList(ITEMS_PER_PAGE, pageParam),
    getNextPageParam: (lastPage) => {
      if (!lastPage.pagination?.hasMore) return undefined;
      return (lastPage.pagination?.offset || 0) + ITEMS_PER_PAGE;
    },
    initialPageParam: 0,
  });

  // Flatten all pages into a single array
  const news = useMemo(() => {
    return data?.pages.flatMap((page) => page.data || []) || [];
  }, [data]);

  const pagination = data?.pages[data.pages.length - 1]?.pagination;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-danger-200 bg-danger-50">
          <CardBody>
            <p className="text-center text-danger-600">
              Failed to load news. Please try again later.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-gray-200">
          <CardBody className="py-12">
            <div className="text-center">
              <p className="text-gray-500">No news available yet.</p>
              <p className="mt-2 text-sm text-gray-400">
                Check back later for updates
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}

      {/* News Grid */}
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {news.map((item) => (
          <Card
            key={item.id}
            className="group cursor-pointer border border-gray-200 transition-all hover:border-primary-300 hover:shadow-lg"
            isPressable
          >
            {item.imageUrl && (
              <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                <Image
                  src={item.imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            )}
            <CardHeader className="flex flex-col items-start gap-2 px-4 pt-4">
              <h2 className="line-clamp-2 text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                {item.title}
              </h2>
              {item.summary && (
                <p className="line-clamp-2 text-sm text-gray-600">
                  {item.summary}
                </p>
              )}
            </CardHeader>
            <CardBody className="px-4 pb-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-gray-400" />
                  <span>
                    {item.publishedAt
                      ? formatDate(item.publishedAt)
                      : formatDate(item.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Eye size={14} className="text-gray-400" />
                  <span>{item.viewCount || "0"}</span>
                </div>
                {item.authorName && (
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-gray-400" />
                    <span className="truncate max-w-[100px]">
                      {item.authorName}
                    </span>
                  </div>
                )}
              </div>
              {item.tags && item.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 transition-colors hover:bg-primary-100"
                    >
                      {tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && (
        <div className="mt-8 flex justify-center">
          <Button
            color="primary"
            variant="flat"
            size="lg"
            onPress={() => fetchNextPage()}
            isLoading={isFetchingNextPage}
            endContent={
              !isFetchingNextPage ? <ChevronDown size={18} /> : undefined
            }
            className="min-w-[140px]"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}

      {/* End of list message */}
      {!hasNextPage && news.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            You've reached the end of the news list
          </p>
        </div>
      )}
    </div>
  );
}
