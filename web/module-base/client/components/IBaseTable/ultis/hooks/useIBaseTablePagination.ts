import type { IBaseTablePagination } from "../../IBaseTableInterface";

import { useMemo } from "react";

import {
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_PAGE_SIZE_OPTIONS,
} from "../../../Pagination/paginationConsts";

export interface UseIBaseTablePaginationProps {
  pagination?: IBaseTablePagination | false;
  total?: number;
  paginationInfo?: {
    currentPage: number;
    pageSize: number;
    pages: number;
    from: number;
    to: number;
    total: number;
  };
}

export interface UseIBaseTablePaginationReturn {
  isPaginationEnabled: boolean;
  paginationConfig: IBaseTablePagination | undefined;
  paginationDefault: {
    page: number;
    pageSize: number;
    pageSizeOptions: number[];
  };
  paginationInfo: {
    currentPage: number;
    pageSize: number;
    pages: number;
    from: number;
    to: number;
    total: number;
  };
  paginationSummary: {
    from: number;
    to: number;
    total: number;
  };
  showPaginationControls: boolean;
}

export function useIBaseTablePagination({
  pagination,
  total: totalProps = 0,
  paginationInfo: corePaginationInfo,
}: UseIBaseTablePaginationProps): UseIBaseTablePaginationReturn {
  // Pagination setup
  const isPaginationEnabled = Boolean(
    pagination && typeof pagination === "object",
  );
  const total = Math.max(0, typeof totalProps === "number" ? totalProps : 0);
  const paginationConfig = isPaginationEnabled
    ? (pagination as IBaseTablePagination)
    : undefined;

  const paginationDefault = useMemo(() => {
    if (!isPaginationEnabled) {
      return {
        page: 1,
        pageSize: PAGINATION_DEFAULT_PAGE_SIZE,
        pageSizeOptions: PAGINATION_PAGE_SIZE_OPTIONS,
      };
    }

    return {
      page: paginationConfig?.page ?? 1,
      pageSize: paginationConfig?.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE,
      pageSizeOptions:
        paginationConfig?.pageSizeOptions ?? PAGINATION_PAGE_SIZE_OPTIONS,
    };
  }, [isPaginationEnabled, paginationConfig]);

  // Use pagination info from core or fallback to defaults
  const paginationInfo = useMemo(() => {
    if (corePaginationInfo) {
      return corePaginationInfo;
    }

    return {
      currentPage: paginationDefault.page,
      pageSize: paginationDefault.pageSize,
      pages: Math.max(1, Math.ceil(total / paginationDefault.pageSize)),
      from:
        total === 0
          ? 0
          : (paginationDefault.page - 1) * paginationDefault.pageSize,
      to:
        total === 0
          ? 0
          : Math.min(
              total,
              paginationDefault.page * paginationDefault.pageSize,
            ),
      total,
    };
  }, [corePaginationInfo, paginationDefault, total]);

  // Pagination summary values (to be translated in component)
  const paginationSummary = useMemo(() => {
    const rowsTotal = paginationInfo.total;
    const from = Math.min(paginationInfo.from + 1, rowsTotal);
    const to = Math.min(paginationInfo.to, rowsTotal);

    return {
      from,
      to,
      total: rowsTotal,
    };
  }, [paginationInfo.from, paginationInfo.to, paginationInfo.total]);

  const showPaginationControls =
    Boolean(isPaginationEnabled) && paginationInfo.total > 0;

  return {
    isPaginationEnabled,
    paginationConfig,
    paginationDefault,
    paginationInfo,
    paginationSummary,
    showPaginationControls,
  };
}
