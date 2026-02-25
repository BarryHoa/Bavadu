"use client";

import type { Column, Row } from "@tanstack/react-table";
import type { IBaseTableUIProps } from "./types/IBaseTableUI.types";

import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { flexRender } from "@tanstack/react-table";
import clsx from "clsx";
import { CSSProperties, useCallback, useMemo, useState } from "react";

import { TableHeaderCell } from "./TableHeaderCell";
import { sortIcons } from "./constants";

/** Renders the leaf header row only (one row of columns). For column groups, TanStack gives multiple header groups; we use the last one. */
export default function IBaseTableUI<T = any>({
  headerGroups,
  rows,
  visibleColumns,

  loading = false,
  emptyContent = "No data available",
  classNames = {},
  tableLayout = "auto",
  scrollHeight = "auto",
  scrollWidth = "auto",
  color = "primary",
  isStriped = true,
  isCompact = true,
  isHeaderSticky = true,
  selectionMode,
  selectedKeys,
  onSelectionChange,
  sortDescriptor,
  onSortChange,
  enableColumnResizing = false,
  enableColumnOrdering = false,
  columnOrder = [],
  onColumnOrderChange,
  setColumnOrder,
  getRowKey,
  renderCell,
  renderHeader,
}: IBaseTableUIProps<T>) {
  const scrollHeightStyle: CSSProperties | undefined =
    scrollHeight !== "auto" && typeof scrollHeight === "object"
      ? {
          minHeight: scrollHeight.minHeight,
          height: scrollHeight.height,
          maxHeight: scrollHeight.maxHeight,
          overflowY: "auto",
        }
      : undefined;
  const scrollWidthStyle: CSSProperties | undefined =
    scrollWidth !== "auto" && typeof scrollWidth === "object"
      ? {
          minWidth: scrollWidth.minWidth,
          width: scrollWidth.width,
          maxWidth: scrollWidth.maxWidth,
          overflowX: "auto",
        }
      : undefined;

  const getSortIcon = useCallback(
    (columnId: string) => {
      if (!sortDescriptor || sortDescriptor.column !== columnId) {
        return sortIcons.default;
      }

      return sortDescriptor.direction === "ascending"
        ? sortIcons.ascending
        : sortIcons.descending;
    },
    [sortDescriptor],
  );

  const handleHeaderClick = useCallback(
    (column: Column<T, unknown>) => {
      if (!column.getCanSort() || !onSortChange) return;
      const columnId = column.id;
      const isSameColumn = sortDescriptor?.column === columnId;
      const nextDirection =
        !isSameColumn || sortDescriptor?.direction === "descending"
          ? "ascending"
          : "descending";

      onSortChange({ column: columnId, direction: nextDirection });
    },
    [sortDescriptor, onSortChange],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!active || !over || active.id === over.id) return;

      const updateOrder = (prev: string[]) => {
        const currentOrder =
          prev.length > 0
            ? prev
            : headerGroups.flatMap((g) => g.headers.map((h) => h.id));
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(currentOrder, oldIndex, newIndex);
        }

        return prev;
      };

      if (setColumnOrder) {
        setColumnOrder(updateOrder);
      } else if (onColumnOrderChange) {
        const currentOrder =
          columnOrder.length > 0
            ? columnOrder
            : headerGroups.flatMap((g) => g.headers.map((h) => h.id));
        const oldIndex = currentOrder.indexOf(active.id as string);
        const newIndex = currentOrder.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1) {
          onColumnOrderChange(arrayMove(currentOrder, oldIndex, newIndex));
        }
      }
    },
    [columnOrder, headerGroups, onColumnOrderChange, setColumnOrder],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
    useSensor(KeyboardSensor),
  );

  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const onDragStart = useCallback(({ active }: { active: { id: unknown } }) => {
    setDraggingColumnId(active.id as string);
  }, []);
  const onDragEndWithReset = useCallback(
    (event: DragEndEvent) => {
      setDraggingColumnId(null);
      handleDragEnd(event);
    },
    [handleDragEnd],
  );

  const sortableIds = useMemo(
    () =>
      columnOrder.length > 0
        ? columnOrder
        : headerGroups.flatMap((g) => g.headers.map((h) => h.id)),
    [columnOrder, headerGroups],
  );

  const memoizedClassNames = useMemo(
    () => ({
      ...classNames,
      tbody: clsx("overflow-x-auto", classNames.tbody),
      table: clsx(classNames.table, "i-base-table"),
      wrapper: clsx("rounded-none p-0", classNames.wrapper),
      th: clsx(
        // Sticky header handled via outer scroll container (div with scrollHeightStyle)
        "px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-foreground bg-default-100 border-b border-r border-default-200 last:border-r-0  z-10",
        classNames.th,
      ),
      tr: clsx(
        "border-b border-default-200/80 transition-colors hover:bg-default-100/80",
        classNames.tr,
      ),
      td: clsx(
        // Override HeroUI default `last:before:rounded-e-lg` so last cell right edge is straight
        "rounded-none py-2 px-3 text-sm text-default-700 last:before:rounded-none",
        classNames.td,
      ),
    }),
    [classNames, enableColumnResizing],
  );

  const columnMap = useMemo(
    () => new Map(visibleColumns.map((col) => [col.id, col])),
    [visibleColumns],
  );

  // Use leaf header row only (last group) so we have one row of TableColumn for HeroUI
  const leafHeaderGroup = headerGroups[headerGroups.length - 1];
  const headerRow = leafHeaderGroup ?? headerGroups[0];

  const tableContent = (
    <Table
      aria-label="Data table"
      classNames={memoizedClassNames}
      color={color}
      removeWrapper
      isCompact={isCompact}
      isStriped={isStriped}
      layout={enableColumnResizing ? "fixed" : tableLayout}
      selectedKeys={selectedKeys}
      selectionMode={selectionMode}
      onSelectionChange={onSelectionChange}
    >
      <TableHeader>
        {headerRow?.headers.map((header) => {
          const column = columnMap.get(header.id);
          const meta =
            (column?.columnDef?.meta as Record<string, unknown>) ?? {};
          const isSortable = header.column.getCanSort();
          const isPinned = header.column.getIsPinned();
          const size = header.column.getSize();
          const isDraggingColumn = draggingColumnId === header.id;
          const dragStyle = isDraggingColumn
            ? {
                ...(isPinned ? {} : { position: "relative" as const }),
                zIndex: 1000,
              }
            : undefined;
          const colStyle = enableColumnResizing
            ? { ...dragStyle, width: size, minWidth: size }
            : { ...dragStyle };

          return (
            <TableColumn
              key={header.id}
              align={(meta.align as "start" | "center" | "end") || "start"}
              allowsSorting={false}
              className={clsx(
                "relative overflow-visible",
                isPinned && "frozen-column",
                isPinned === "left" && "frozen-left",
                isPinned === "right" && "frozen-right",
              )}
              maxWidth={column?.columnDef.maxSize}
              minWidth={column?.columnDef.minSize}
              style={colStyle}
              width={size}
            >
              <TableHeaderCell
                column={column!}
                enableColumnOrdering={enableColumnOrdering}
                enableColumnResizing={enableColumnResizing}
                getSortIcon={getSortIcon}
                header={header}
                headerGroup={headerRow}
                isSortable={isSortable}
                meta={meta}
                renderHeader={renderHeader}
                onHeaderClick={handleHeaderClick}
              />
            </TableColumn>
          );
        })}
      </TableHeader>
      <TableBody
        emptyContent={emptyContent}
        isLoading={loading}
        items={useMemo(
          () =>
            rows.map((row) => ({
              row,
              original: row.original,
              index: row.index,
            })),
          [rows],
        )}
        loadingContent={<Spinner label="Loading..." />}
        style={{
          ...scrollWidthStyle,
        }}
      >
        {({
          row,
          original,
          index,
        }: {
          row: Row<T>;
          original: T;
          index: number;
        }) => {
          const rowKey = getRowKey(original, index);
          const stripeClass =
            isStriped && index % 2 === 1 ? "bg-default-50" : "bg-white";

          return (
            <TableRow key={rowKey} className={stripeClass}>
              {row.getVisibleCells().map((cell) => {
                const column = columnMap.get(cell.column.id);
                const meta =
                  (column?.columnDef?.meta as Record<string, unknown>) ?? {};
                const isPinned = cell.column.getIsPinned();
                const pinStyle = isPinned
                  ? {
                      position: "sticky" as const,
                      [isPinned === "left" ? "left" : "right"]:
                        cell.column.getStart(isPinned),
                    }
                  : undefined;

                return (
                  <TableCell
                    key={cell.id}
                    className={clsx(
                      stripeClass,
                      isPinned && "frozen-column",
                      isPinned === "left" && "frozen-left",
                      isPinned === "right" && "frozen-right",
                    )}
                    style={{
                      ...pinStyle,
                      width: cell.column.getSize(),
                      minWidth: cell.column.getSize(),
                    }}
                  >
                    <div
                      className={clsx(
                        "flex",
                        `justify-${(meta.align as string) || "start"}`,
                      )}
                    >
                      {renderCell
                        ? (() => {
                            const customRender = renderCell(
                              column!,
                              row,
                              cell.getValue(),
                            );

                            return customRender != null
                              ? customRender
                              : flexRender(
                                  cell.column.columnDef.cell,
                                  cell.getContext(),
                                );
                          })()
                        : flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          );
        }}
      </TableBody>
    </Table>
  );

  // When scrollHeight is object, this div becomes the scroll container (supports px or CSS strings like calc(100vh - 250px)).
  const scrollContainerClass =
    scrollHeight !== "auto" && typeof scrollHeight === "object"
      ? "overflow-y-auto overflow-x-auto"
      : "";

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      sensors={sensors}
      onDragEnd={onDragEndWithReset}
      onDragStart={onDragStart}
    >
      <SortableContext
        items={sortableIds}
        strategy={horizontalListSortingStrategy}
      >
        <div
          className={clsx("relative", scrollContainerClass)}
          style={scrollHeightStyle}
        >
          {tableContent}
        </div>
      </SortableContext>
    </DndContext>
  );
}
