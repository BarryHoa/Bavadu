import { useState, useMemo, useCallback, useEffect } from "react";

import {
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_PAGE_SIZE_OPTIONS,
} from "./pagginationConts";

export interface UsePaginationProps {
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  defaultPage?: number;
  total?: number; // For server-side pagination
  onChange?: (params: { page: number; pageSize: number }) => void;
}

export interface UsePaginationReturn<T = any> {
  // Current state
  currentPage: number;
  pageSize: number;
  pageSizeOptions: number[];
  pages: number;

  // Pagination info
  from: number;
  to: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  handleChangePage: (page: number) => number;
  handleChangePageSize: (pageSize: number) => number;
  resetPage: () => void;
}

export default function usePagination({
  pageSizeOptions = PAGINATION_PAGE_SIZE_OPTIONS,
  defaultPageSize = PAGINATION_DEFAULT_PAGE_SIZE,
  defaultPage = 1,
  total = 0,
  onChange,
}: UsePaginationProps): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const pageSizeBefore = useMemo(() => {
    return pageSizeOptions.includes(defaultPageSize)
      ? defaultPageSize
      : pageSizeOptions[0] || PAGINATION_DEFAULT_PAGE_SIZE;
  }, [defaultPageSize, pageSizeOptions]);

  // Calculate total pages
  const pages = useMemo(() => {
    return Math.ceil(total / pageSizeBefore) || 1;
  }, [total, pageSizeBefore]);

  const currentPageBefore = useMemo(() => {
    if (defaultPage > pages) {
      return pages;
    }

    return defaultPage;
  }, [defaultPage]);

  useEffect(() => {
    // update for page size
    if (pageSizeBefore !== pageSize) {
      setPageSize(pageSizeBefore);
    }
  }, [pageSizeBefore]);

  useEffect(() => {
    // update for current page
    if (currentPageBefore !== currentPage) {
      setPageSize(currentPageBefore);
    }
  }, [currentPageBefore]);

  // Check if has next/prev page
  const hasNextPage = useMemo(() => {
    return currentPage < pages;
  }, [currentPage, pages]);

  const hasPrevPage = useMemo(() => {
    return currentPage > 1;
  }, [currentPage]);

  const from = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const to = useMemo(() => {
    return Math.min(from + pageSize, total);
  }, [from, pageSize, total]);

  const handleChangePage = useCallback(
    (page: number) => {
      if (page > pages || page < 1) {
        setCurrentPage(pages);

        return pages;
      }
      setCurrentPage(page);

      return page;
    },
    [pages],
  );
  const handleChangePageSize = useCallback(
    (pageSize: number) => {
      if (!pageSizeOptions.includes(pageSize)) {
        setPageSize(pageSizeOptions[0]);

        return pageSizeOptions[0];
      }
      setPageSize(pageSize);

      return pageSize;
    },
    [pageSizeOptions],
  );
  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, [currentPage]);

  return {
    // State
    currentPage,
    pageSize,
    pageSizeOptions,
    pages,
    // Info
    from,
    to,
    hasNextPage,
    hasPrevPage,
    handleChangePage,
    handleChangePageSize,
    resetPage,
  };
}
