"use client";

import type { IBaseLinkProps } from "@base/client";
import type { FilterOption } from "./components/FilterMenu";
import type { GroupOption } from "./components/GroupByMenu";

import { useTranslations } from "next-intl";
import { memo, useMemo } from "react";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseEmpty,
} from "@base/client/components";

import { useLocalizedText } from "../../hooks/useLocalizedText";
import { IBaseLink } from "../IBaseLink";
import { IBaseTable } from "../IBaseTable";
import { IBaseTablePagination } from "../IBaseTable/IBaseTableInterface";
import { PAGINATION_DEFAULT_PAGE_SIZE } from "../Pagination/paginationConsts";

import ColumnVisibilityMenu from "./components/ColumnVisibilityMenu";
import FilterMenu from "./components/FilterMenu";
import GroupByMenu from "./components/GroupByMenu";
import SearchBar from "./components/SearchBar";
import { useViewListDataTableQueries } from "./useViewListDataTableQueries";
import { useViewListDataTableStore } from "./useViewListDataTableStore";
import {
  ActionElm,
  ViewListDataTableProps,
} from "./ViewListDataTableInterface";

// Memoized Table component to prevent re-renders when search/filter changes
const MemoizedTable = memo(
  ({
    dataTableProps,
    columns,
    dataSource,
    loading,
    pagination,
    total,
    onChangeTable,
    onRefresh,
  }: {
    dataTableProps: any;
    columns: any[];
    dataSource: any[];
    loading: boolean | undefined;
    pagination: IBaseTablePagination | false;
    total: number;
    onChangeTable: any;
    onRefresh: any;
  }) => {
    return (
      <IBaseTable
        {...dataTableProps}
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        pagination={pagination}
        total={total}
        onChangeTable={onChangeTable}
        onRefresh={onRefresh}
      />
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only compare data-related props
    // Callbacks (onChangeTable, onRefresh) are intentionally excluded as they may change reference
    // but their behavior remains the same
    const paginationEqual =
      prevProps.pagination === nextProps.pagination ||
      (prevProps.pagination !== false &&
        nextProps.pagination !== false &&
        prevProps.pagination.page === nextProps.pagination.page &&
        prevProps.pagination.pageSize === nextProps.pagination.pageSize);

    return (
      prevProps.columns === nextProps.columns &&
      prevProps.dataSource === nextProps.dataSource &&
      prevProps.loading === nextProps.loading &&
      prevProps.total === nextProps.total &&
      paginationEqual
    );
  },
);

MemoizedTable.displayName = "MemoizedTable";

export default function ViewListDataTable<T = any>(
  props: ViewListDataTableProps<T>,
) {
  const {
    columns,
    model,
    title,
    search,
    filter,
    groupBy,
    favorite,
    columnVisibility,
    isDummyData = false,
    actionsLeft,
    actionsRight,
    pagination: _pagination = {
      page: 1,
      pageSize: PAGINATION_DEFAULT_PAGE_SIZE,
    },
    ...dataTableProps
  } = props;

  // Use the store hook - each instance gets its own store
  const store = useViewListDataTableStore({
    columns,
  });
  const getLocalizedText = useLocalizedText();
  const tDataTable = useTranslations("dataTable");
  const defaultEmptyContent = <IBaseEmpty description={tDataTable("empty")} />;
  const effectiveEmptyContent =
    dataTableProps.emptyContent !== undefined &&
    dataTableProps.emptyContent !== null
      ? dataTableProps.emptyContent
      : defaultEmptyContent;
  const isFilterHidden = filter?.hidden === true;
  const isSearchHidden = search?.hidden === true;
  const isGroupByHidden = groupBy?.hidden === true;
  // const isFavoriteHidden = favorite?.hidden === true;
  const isColumnVisibilityHidden = columnVisibility?.hidden === true;
  // Fetch data using react-query
  const {
    data: dataSource,
    isDataDummy,
    total,
    isLoading,
    isFetching,
    error: fetchError,
    refresh,
    onChangeTable,
  } = useViewListDataTableQueries<T>({
    model,
    isDummyData,
    pagination: _pagination as IBaseTablePagination,
    // enabled: !propDataSource, // Only fetch if dataSource is not provided as prop
  });

  // Memoize loading state
  const tableLoading = useMemo(
    () => isLoading || isFetching || dataTableProps.loading,
    [isLoading, isFetching, dataTableProps.loading],
  );

  // Memoize pagination object to ensure stable reference
  const memoizedPagination = useMemo(
    () => _pagination,
    [
      _pagination === false
        ? false
        : `${_pagination.page ?? 1}-${_pagination.pageSize ?? PAGINATION_DEFAULT_PAGE_SIZE}`,
    ],
  );

  // Memoize filter and groupBy options
  const filterOptions: FilterOption<T>[] = useMemo(() => [], []);
  const groupByOptions: GroupOption[] = useMemo(() => [], []);

  // Memoize visible columns filtering
  const cols = useMemo(
    () => columns.filter((col: any) => store.visibleColumns.has(col.key)),
    [columns, store.visibleColumns],
  );

  // Memoize display columns (with dummy render if needed)
  const displayColumns = useMemo(
    () =>
      isDataDummy
        ? cols.map((col: any) => ({
            ...col,
            render: () => null,
          }))
        : cols,
    [cols, isDataDummy],
  );

  // Memoize renderActions callback
  const renderActions = useMemo(
    () => (acts: ActionElm[]) => {
      return acts?.map((action) => {
        const size = action.size ?? "sm";
        const variant = action.variant ?? "solid";
        const color = action.color ?? "default";

        switch (action.type) {
          case "button":
            return (
              <IBaseButton
                key={action.key}
                isIconOnly
                color={color}
                size={size}
                variant={variant}
                {...(action.props as any)}
              >
                {action.title}
              </IBaseButton>
            );
          case "link":
            const linkProps = action.props as Omit<IBaseLinkProps, "as"> & {
              hrefAs?: any;
              as?: any;
            };

            const { as, href, hrefAs, ...restLinkProps } = linkProps as any;

            return (
              <IBaseButton
                key={action.key}
                as={IBaseLink as any}
                color={color}
                href={linkProps.href as string}
                hrefAs={hrefAs ?? as}
                size={size}
                variant={variant}
                {...restLinkProps}
              >
                {action.title}
              </IBaseButton>
            );
          default:
            return null;
        }
      });
    },
    [actionsLeft, actionsRight],
  );

  const hasSecondaryTools =
    !isFilterHidden || !isGroupByHidden || !isColumnVisibilityHidden;

  // Render: one clean toolbar row, minimal card, table in scroll wrapper
  return (
    <IBaseCard className="shadow-sm border border-default-100 overflow-hidden">
      {title && (
        <div className="border-b border-default-200/80 px-4 py-3 sm:px-5 sm:py-3.5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {getLocalizedText(title)}
          </h2>
        </div>
      )}

      <IBaseCardBody className="p-4 sm:p-2">
        {/* Single toolbar row: search (left) | actions + tools (right) */}
        <div className="mb-2 flex flex-col gap-3 sm:mb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          {!isSearchHidden && (
            <div className="w-full sm:max-w-[280px]">
              <SearchBar
                placeholder={search?.placeholder}
                value={store.search}
                onChange={store.setSearch}
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {renderActions(actionsLeft ?? [])}
            {renderActions(actionsRight ?? [])}
            {hasSecondaryTools && (
              <span className="hidden h-5 w-px bg-default-200 sm:inline-block" />
            )}
            {!isFilterHidden && (
              <FilterMenu
                activeFilters={store.activeFilters}
                filterOptions={filterOptions}
                onToggleFilter={store.toggleFilter}
              />
            )}
            {!isGroupByHidden && (
              <GroupByMenu
                currentGroupBy={store.groupBy}
                groupByOptions={groupByOptions}
                onSelectGroupBy={store.setGroupBy}
              />
            )}
            {!isColumnVisibilityHidden && (
              <ColumnVisibilityMenu
                columns={columns}
                visibleColumns={store.visibleColumns}
                onToggleColumn={store.toggleColumn}
              />
            )}
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-lg border border-default-200/80">
          <MemoizedTable
            columns={displayColumns}
            dataSource={dataSource}
            dataTableProps={{
              ...dataTableProps,
              emptyContent: effectiveEmptyContent,
              isDraggableColumns: dataTableProps.isDraggableColumns ?? true,
              isResizableColumns: dataTableProps.isResizableColumns ?? true,
            }}
            loading={tableLoading}
            pagination={memoizedPagination}
            total={total}
            onChangeTable={onChangeTable}
            onRefresh={refresh}
          />
        </div>
      </IBaseCardBody>
    </IBaseCard>
  );
}
