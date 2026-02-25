"use client";

import { useMutation } from "@tanstack/react-query";
import throttle from "lodash/throttle";
import { useEffect, useMemo, useState } from "react";

import { SortDescriptor } from "@base/client";

import UserSavingColumnService from "../../services/UserSavingColumnService";
import ViewListDataTableService from "../../services/ViewListDataTableService";
import {
  IBaseTableColumnDefinition,
  IBaseTablePagination,
} from "../IBaseTable/IBaseTableInterface";
import { PAGINATION_DEFAULT_PAGE_SIZE } from "../Pagination/paginationConsts";

type TableParams = {
  page: number;
  pageSize: number;
  sort?: SortDescriptor;
};

type TableDataState<T> = {
  data: T[];
  total: number;
  isDummyData: boolean;
};

interface UseViewListDataTableQueriesOptions<T = any> {
  model: string;
  columns: IBaseTableColumnDefinition<T>[];
  isDummyData?: boolean;
  pagination: IBaseTablePagination;
  columnVisibilitySavingKey?: string;
}

export function useViewListDataTableQueries<T = any>({
  model,
  columns,
  isDummyData = false,
  pagination,
  columnVisibilitySavingKey,
}: UseViewListDataTableQueriesOptions<T>) {
  const dataService = useMemo(() => new ViewListDataTableService(), []);
  const columnService = useMemo(() => new UserSavingColumnService(), []);

  const [params, setParams] = useState<TableParams>({
    page: pagination?.page ?? 1,
    pageSize: pagination?.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE,
  });

  // ---------------------------------------------------------------------------
  // UI state
  // ---------------------------------------------------------------------------
  const [search, setSearch] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    () => new Set(columns.map((c) => c.key)),
  );
  // Đánh dấu khi cấu hình cột (visibleColumns) đã được load ổn định (API hoặc default).
  const [isColumnsReady, setIsColumnsReady] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    () => new Set(),
  );
  const [groupBy, setGroupBy] = useState<string | null>(null);
  const [showFavorite, setShowFavorite] = useState(false);

  const toggleFilter = (label: string) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);

      next.has(label) ? next.delete(label) : next.add(label);

      return next;
    });
  };

  const clearFilters = () => setActiveFilters(new Set());

  const toggleFavorite = () => setShowFavorite((prev) => !prev);

  const reset = () => {
    setSearch("");
    setVisibleColumns(new Set(columns.map((c) => c.key)));
    setActiveFilters(new Set());
    setGroupBy(null);
    setShowFavorite(false);
  };

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const modelKey = model;

  const [dataState, setDataState] = useState<TableDataState<T>>({
    data: [],
    total: 0,
    isDummyData: false,
  });

  const fetchMutation = useMutation({
    mutationFn: async (requestParams?: TableParams) => {
      const body = requestParams || params;
      const offset = (body.page - 1) * body.pageSize;

      const response = await dataService.getData({
        model: modelKey,
        params: {
          offset,
          limit: body.pageSize,
          sorts: body.sort ? [body.sort] : [],
        },
      });

      const dataResponse = response.data ?? [];

      if (response.total > 0) {
        return {
          data: dataResponse as T[],
          total: response.total,
          isDummyData: false,
        };
      }

      if (isDummyData) {
        return {
          data: Array.from({ length: 4 }, () => ({})) as T[],
          total: 0,
          isDummyData: true,
        };
      }

      return { data: [], total: 0, isDummyData: false };
    },
    onSuccess: (result) => {
      setDataState(result);
    },
  });

  useEffect(() => {
    if (!modelKey) return;
    fetchMutation.mutate(undefined);
  }, [modelKey]);

  const refresh = () => {
    if (!modelKey) return;
    fetchMutation.mutate(undefined);
  };

  const onChangeTable = (next: TableParams) => {
    setParams(next);
    fetchMutation.mutate(next);
  };

  // ---------------------------------------------------------------------------
  // Column visibility persistence (throttled)
  // ---------------------------------------------------------------------------
  const throttledPersistColumns = useMemo(
    () =>
      columnVisibilitySavingKey
        ? throttle((cols: string[]) => {
            columnService
              .setColumns({
                key: columnVisibilitySavingKey,
                columns: cols,
              })
              .catch(() => {
                // ignore RPC errors
              });
          }, 500)
        : null,
    [columnService, columnVisibilitySavingKey],
  );

  useEffect(
    () => () => {
      throttledPersistColumns?.cancel();
    },
    [throttledPersistColumns],
  );

  // Load & sync column visibility: ưu tiên API, fallback default sau 1s (Promise.race)
  useEffect(() => {
    const defaultSet = new Set(columns.map((c) => c.key));
    const allowed = new Set(columns.map((c) => c.key));

    let isMounted = true;
    let hasApplied = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const applyColumns = (cols: Set<string>) => {
      if (!isMounted) return;
      hasApplied = true;
      setVisibleColumns(cols);
      // Sau lần áp dụng đầu tiên (từ API hoặc default), coi như cấu hình cột đã “ổn định”
      setIsColumnsReady(true);
    };

    const applyDefaultIfNeeded = () => {
      if (!hasApplied) {
        applyColumns(defaultSet);
      }
    };

    const apiPromise: Promise<void> = columnVisibilitySavingKey
      ? columnService
          .getColumns({ key: columnVisibilitySavingKey })
          .then((res) => {
            if (!isMounted) return;

            if (
              res?.success &&
              Array.isArray(res.columns) &&
              res.columns.length
            ) {
              const next = new Set(
                res.columns.filter((key) => allowed.has(key)),
              );

              if (next.size > 0) {
                applyColumns(next);

                return;
              }
            }

            // API không trả về hợp lệ
            applyDefaultIfNeeded();
          })
          .catch(() => {
            // Lỗi RPC -> fallback default nếu chưa áp dụng gì
            applyDefaultIfNeeded();
          })
      : Promise.resolve().then(() => {
          applyDefaultIfNeeded();
        });

    const timeoutPromise = new Promise<void>((resolve) => {
      timeoutId = setTimeout(() => {
        applyDefaultIfNeeded();
        resolve();
      }, 1000);
    });

    // Ưu tiên API, nhưng đảm bảo sau 1s luôn có ít nhất default
    void Promise.race([apiPromise, timeoutPromise]);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
    // only run only one
  }, []);

  const onToggleColumn = (key: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);

      next.has(key) ? next.delete(key) : next.add(key);

      if (throttledPersistColumns) {
        throttledPersistColumns(Array.from(next));
      }

      return next;
    });
  };

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------
  return {
    data: dataState.data,
    isDataDummy: dataState.isDummyData,
    total: dataState.total,
    isLoading: fetchMutation.isPending && dataState.data.length === 0,
    isFetching: fetchMutation.isPending,
    error: fetchMutation.error
      ? fetchMutation.error instanceof Error
        ? fetchMutation.error.message
        : "Failed to fetch data"
      : null,
    queryKeys: undefined,
    refresh,
    onChangeTable,

    // UI state & actions
    search,
    setSearch,
    visibleColumns,
    setVisibleColumns,
    activeFilters,
    setActiveFilters,
    toggleFilter,
    clearFilters,
    groupBy,
    setGroupBy,
    showFavorite,
    setShowFavorite,
    toggleFavorite,
    reset,
    onToggleColumn,
    isColumnsReady,
  };
}
