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
import {
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
  IBaseTablePagination,
} from "../IBaseTable/IBaseTableInterface";
import { PAGINATION_DEFAULT_PAGE_SIZE } from "../Pagination/paginationConsts";

import ColumnVisibilityMenu from "./components/ColumnVisibilityMenu";
import FilterMenu from "./components/FilterMenu";
import GroupByMenu from "./components/GroupByMenu";
import SearchBar from "./components/SearchBar";
import { useViewListDataTableQueries } from "./useViewListDataTableQueries";
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
    favorite: _favorite,
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

  const columnVisibilitySavingKey = columnVisibility?.savingKey ?? model;
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
  // Fetch data using react-query + UI state
  const {
    data: dataSource,
    isDataDummy,
    total,
    isLoading,
    isFetching,
    error: _fetchError,
    refresh,
    onChangeTable,
    // UI state & actions
    search: searchValue,
    setSearch,
    visibleColumns,
    activeFilters,
    toggleFilter,
    groupBy: groupByValue,
    setGroupBy,
    onToggleColumn,
    isColumnsReady,
  } = useViewListDataTableQueries<T>({
    model,
    columns,
    isDummyData,
    pagination: _pagination as IBaseTablePagination,
    columnVisibilitySavingKey,
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
    () => columns.filter((col: any) => visibleColumns.has(col.key)),
    [columns, visibleColumns],
  );

  // Khi cấu hình cột chưa sẵn sàng, render tạm 1 column duy nhất, không có title
  const renderColumns = useMemo(() => {
    if (!isColumnsReady) {
      return [
        {
          key: "__loading__",
          label: "",
          title: "",
          align: "center",
          render: () => null,
        } as any,
      ];
    }
    const col_number = {
      key: I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
      label: tDataTable("columns.number"),
      render: (_record: T, index: number) => index + 1,
    } as any;
    const col_process = [col_number, ...cols];
    if (isDataDummy) {
      return col_process.map((col: any) => ({
        ...col,
        render: () => null,
      }));
    }

    return col_process;
  }, [isColumnsReady, isDataDummy, cols]);

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
            <div className="w-full sm:min-w-[18rem] sm:max-w-[20rem]">
              <SearchBar
                placeholder={search?.placeholder}
                value={searchValue}
                onChange={setSearch}
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
                activeFilters={activeFilters}
                filterOptions={filterOptions}
                onToggleFilter={toggleFilter}
              />
            )}
            {!isGroupByHidden && (
              <GroupByMenu
                currentGroupBy={groupByValue}
                groupByOptions={groupByOptions}
                onSelectGroupBy={setGroupBy}
              />
            )}
            {!isColumnVisibilityHidden && (
              <ColumnVisibilityMenu
                columns={columns}
                excludeKeys={columnVisibility?.excludeKeys ?? []}
                visibleColumns={visibleColumns}
                onToggleColumn={onToggleColumn}
              />
            )}
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-lg border border-default-200/80">
          <MemoizedTable
            columns={renderColumns}
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
