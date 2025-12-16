"use client";

import { SortDescriptor } from "@heroui/react";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import ViewListDataTableService from "../../services/ViewListDataTableService";
import { IBaseTablePagination } from "../IBaseTable/IBaseTableInterface";
import { PAGINATION_DEFAULT_PAGE_SIZE } from "../Pagination/paginationConsts";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UseViewListDataTableQueriesOptions<T = any> {
  model: string;
  isDummyData?: boolean;
  pagination: IBaseTablePagination;
}

export function useViewListDataTableQueries<T = any>({
  model,
  isDummyData = true,
  pagination,
}: UseViewListDataTableQueriesOptions<T>) {
  const service = useMemo(() => new ViewListDataTableService(), []);
  const [params, setParams] = useState<{
    page: number;
    pageSize: number;
    sort?: SortDescriptor;
  }>({
    page: pagination?.page ?? 1,
    pageSize: pagination?.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE,
  });

  // Validate model format (should be module.model)
  const modelKey = model;

  const [dataState, setDataState] = useState<{
    data: T[];
    total: number;
    isDummyData: boolean;
  }>({
    data: [],
    total: 0,
    isDummyData: false,
  });

  const fetchMutation = useMutation({
    mutationFn: async (requestParams?: {
      page: number;
      pageSize: number;
      sort?: SortDescriptor;
    }) => {
      const body = requestParams || params;
      const offset = (body.page - 1) * body.pageSize;
      const response = await service.getData({
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

  // Initial fetch - sử dụng params từ state
  useEffect(() => {
    if (!modelKey) return;
    fetchMutation.mutate(undefined); // undefined = dùng params từ state
  }, [modelKey, fetchMutation]);

  const refresh = () => {
    if (!modelKey) return;
    fetchMutation.mutate(undefined); // undefined = dùng params từ state
  };

  const onChangeTable = (next: {
    page: number;
    pageSize: number;
    sort?: SortDescriptor;
  }) => {
    setParams(next);
    // FIX: Pass params trực tiếp để tránh race condition
    // setParams là async, nên mutate với params mới ngay lập tức
    fetchMutation.mutate(next);
  };

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
  };
}
