import { useCallback, useEffect, useMemo, useState } from "react";

import {
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_PAGE_SIZE_OPTIONS,
} from "./paginationConsts";

export interface UsePaginationProps {
  pageSizeOptions?: number[];
  defaultPageSize?: number;
  defaultPage?: number;
  total?: number; // For server-side pagination
  onChange?: (params: { page: number; pageSize: number }) => void;
}

export interface UsePaginationReturn {
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
  const resolvePageSize = useCallback(() => {
    if (pageSizeOptions.length === 0) {
      return PAGINATION_DEFAULT_PAGE_SIZE;
    }

    return pageSizeOptions.includes(defaultPageSize)
      ? defaultPageSize
      : pageSizeOptions[0];
  }, [defaultPageSize, pageSizeOptions]);

  const [pageSize, setPageSize] = useState(resolvePageSize);

  useEffect(() => {
    const nextPageSize = resolvePageSize();

    if (nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
    }
  }, [pageSize, resolvePageSize]);

  const safeTotal = Math.max(0, total);

  const pages = useMemo(() => {
    return Math.max(1, Math.ceil(safeTotal / pageSize));
  }, [pageSize, safeTotal]);

  const clampPage = useCallback(
    (value: number) => {
      if (Number.isNaN(value) || !Number.isFinite(value)) {
        return 1;
      }

      return Math.min(Math.max(1, Math.trunc(value)), pages);
    },
    [pages],
  );

  const [currentPage, setCurrentPage] = useState(() =>
    clampPage(defaultPage),
  );

  useEffect(() => {
    const nextPage = clampPage(defaultPage);

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
    }
  }, [clampPage, currentPage, defaultPage]);

  useEffect(() => {
    const nextPage = clampPage(currentPage);

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage);
    }
  }, [clampPage, currentPage]);

  const from = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const to = useMemo(() => {
    return Math.min(from + pageSize, safeTotal);
  }, [from, pageSize, safeTotal]);

  const hasNextPage = currentPage < pages;
  const hasPrevPage = currentPage > 1;

  const handleChangePage = useCallback(
    (value: number) => {
      const nextPage = clampPage(value);

      if (nextPage !== currentPage) {
        setCurrentPage(nextPage);
      }

      return nextPage;
    },
    [clampPage, currentPage],
  );

  const handleChangePageSize = useCallback(
    (value: number) => {
      const nextPageSize = pageSizeOptions.includes(value)
        ? value
        : resolvePageSize();

      if (nextPageSize !== pageSize) {
        setPageSize(nextPageSize);
      }

      return nextPageSize;
    },
    [pageSize, pageSizeOptions, resolvePageSize],
  );

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (!onChange) {
      return;
    }

    onChange({ page: currentPage, pageSize });
  }, [currentPage, onChange, pageSize]);

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
