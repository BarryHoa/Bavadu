"use client";

import type { IBaseLinkProps } from "@base/client";
import type { FilterOption } from "./components/FilterMenu";
import type { GroupOption } from "./components/GroupByMenu";

import { useCallback, useMemo } from "react";

import { IBaseButton, IBaseCard, IBaseCardBody, IBaseDivider } from "@base/client/components";

import { useLocalizedText } from "../../hooks/useLocalizedText";
import { IBaseTable } from "../IBaseTable";
import { IBaseTablePagination } from "../IBaseTable/IBaseTableInterface";
import LinkAs from "../LinkAs";
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

export default function ViewListDataTable<T = any>(
  props: ViewListDataTableProps<T>
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
    isDummyData = true,
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
  const isFilterHidden = filter?.hidden === true;
  const isSearchHidden = search?.hidden === true;
  const isGroupByHidden = groupBy?.hidden === true;
  const isFavoriteHidden = favorite?.hidden === true;
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

  const filterOptions = useMemo<FilterOption<T>[]>(() => {
    return [];
  }, []);
  const groupByOptions = useMemo<GroupOption[]>(() => {
    return [];
  }, []);

  // Prepare columns list with only visible columns
  const displayColumns = useMemo(() => {
    const cols = columns.filter((col: any) =>
      store.visibleColumns.has(col.key)
    );

    if (isDataDummy) {
      return cols.map((col: any) => ({
        ...col,
        render: () => null,
      }));
    }

    return cols;
  }, [columns, store.visibleColumns, isDataDummy]);

  const renderActions = useCallback(
    (acts: ActionElm[]) => {
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
            };

            return (
              <IBaseButton
                key={action.key}
                as={LinkAs as any}
                color={color}
                href={linkProps.href as string}
                size={size}
                variant={variant}
                {...(linkProps as any)}
                // {...(linkProps as any)}
              >
                {action.title}
              </IBaseButton>
            );
          default:
            return null;
        }
      });
    },
    [actionsLeft, actionsRight]
  );

  // Render
  return (
    <IBaseCard>
      {/* Actions Bar */}
      {title && (
        <div className="flex gap-2 flex-wrap flex-col px-3 py-2">
          <h4 className="text-medium font-medium">{getLocalizedText(title)}</h4>
          <IBaseDivider className="my-0" />
        </div>
      )}

      <IBaseCardBody className={`${title ? "pt-0" : ""}`}>
        <div className="flex gap-2 items-center mb-4 flex-wrap">
          <div className="flex gap-2 flex-1 justify-start">
            {renderActions(actionsLeft ?? [])}
          </div>

          <div className="flex gap-2 flex-1 justify-end">
            {!isSearchHidden && (
              <SearchBar
                placeholder={search?.placeholder}
                value={store.search}
                onChange={store.setSearch}
              />
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
            {renderActions(actionsRight ?? [])}

            {!isColumnVisibilityHidden && (
              <ColumnVisibilityMenu
                columns={columns}
                visibleColumns={store.visibleColumns}
                onToggleColumn={store.toggleColumn}
              />
            )}
          </div>
        </div>

        {/* IBaseTablePrimitive */}
        <IBaseTable
          {...dataTableProps}
          columns={displayColumns}
          dataSource={dataSource}
          loading={isLoading || isFetching || dataTableProps.loading}
          pagination={_pagination}
          total={total}
          onChangeTable={onChangeTable}
          onRefresh={refresh}
        />
      </IBaseCardBody>
    </IBaseCard>
  );
}
