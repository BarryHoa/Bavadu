"use client";

import type { SortDescriptor, TableProps } from "@heroui/table";
import type { Column, Header, HeaderGroup, Row } from "@tanstack/react-table";
import type { ReactNode } from "react";

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
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
import {
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  GripVertical,
} from "lucide-react";
import { useCallback, useMemo } from "react";

export interface IBaseTableUIProps<T = any> {
  // TanStack Table data
  headerGroups: HeaderGroup<T>[];
  rows: Row<T>[];
  visibleColumns: Column<T, unknown>[];

  // UI Props
  loading?: boolean;
  emptyContent?: ReactNode;
  classNames?: {
    wrapper?: string;
    table?: string;
    thead?: string;
    tbody?: string;
    tr?: string;
    th?: string;
    td?: string;
  };
  tableLayout?: "auto" | "fixed";
  color?: TableProps["color"];
  isStriped?: boolean;
  isCompact?: boolean;
  isHeaderSticky?: boolean;

  // Selection
  selectionMode?: TableProps["selectionMode"];
  selectedKeys?: TableProps["selectedKeys"];
  onSelectionChange?: TableProps["onSelectionChange"];

  // Sorting
  sortDescriptor?: SortDescriptor;
  onSortChange?: (sort: SortDescriptor) => void;

  // Column resize & reorder
  enableColumnResizing?: boolean;
  enableColumnOrdering?: boolean;
  columnOrder?: string[];
  onColumnOrderChange?: (order: string[]) => void;
  setColumnOrder?: (updater: string[] | ((prev: string[]) => string[])) => void;

  // Column configuration
  getRowKey: (record: T, index: number) => string;
  renderCell?: (
    column: Column<T, unknown>,
    row: Row<T>,
    value: any,
  ) => ReactNode;
  renderHeader?: (
    header: HeaderGroup<T>,
    column: Column<T, unknown>,
  ) => ReactNode;
}

// Memoize sort icons to prevent recreation
const sortIcons = {
  default: <ChevronsUpDown aria-hidden className="h-3.5 w-3.5 opacity-70" />,
  ascending: <ChevronUp aria-hidden className="h-3.5 w-3.5 opacity-90" />,
  descending: <ChevronDown aria-hidden className="h-3.5 w-3.5 opacity-90" />,
} as const;

const alignClassMap = {
  end: "justify-end",
  center: "justify-center",
  start: "justify-start",
} as const;

function TableHeaderCell<T>({
  header,
  column,
  meta,
  isSortable,
  getSortIcon,
  onHeaderClick,
  enableColumnResizing,
  enableColumnOrdering,
  renderHeader,
  headerGroup,
}: {
  header: Header<T, unknown>;
  column: Column<T, unknown>;
  meta: Record<string, any>;
  isSortable: boolean;
  getSortIcon: (columnId: string) => ReactNode;
  onHeaderClick: (column: Column<T, unknown>) => void;
  enableColumnResizing: boolean;
  enableColumnOrdering: boolean;
  renderHeader?: (
    header: HeaderGroup<T>,
    column: Column<T, unknown>,
  ) => ReactNode;
  headerGroup: HeaderGroup<T>;
}) {
  const isDraggable = enableColumnOrdering && meta?.isDraggable !== false;
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
      disabled: !isDraggable,
    });

  const resizeHandler = header.getResizeHandler?.();
  const canResize =
    enableColumnResizing && header.column.getCanResize?.() && resizeHandler;
  const alignClass =
    alignClassMap[meta.align as keyof typeof alignClassMap] ?? "justify-start";

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "group flex h-full w-full items-center",
        isDragging &&
          "rounded-md border-2 border-primary shadow-md ring-2 ring-primary/30",
      )}
      style={{
        opacity: isDragging ? 0.8 : 1,
        transform: CSS.Translate.toString(transform),
        transition: isDragging ? "none" : undefined,
        whiteSpace: "nowrap" as const,
        width: header.column.getSize(),
        minWidth: header.column.getSize(),
        willChange: isDragging ? "transform" : undefined,
        zIndex: isDragging ? 1 : 0,
      }}
    >
      <div
        className={clsx(
          "inline-flex h-full flex-1 items-center",
          isSortable && "cursor-pointer select-none",
        )}
        role={isSortable ? "button" : undefined}
        tabIndex={isSortable ? 0 : -1}
        onClick={() => onHeaderClick(header.column)}
      >
        {isDraggable && (
          <span
            className="mr-1.5 inline-flex cursor-grab touch-none items-center text-default-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-default-600 active:cursor-grabbing"
            aria-hidden
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </span>
        )}
        <span className={clsx("inline-flex flex-1 items-center", alignClass)}>
          {renderHeader
            ? renderHeader(headerGroup, column)
            : flexRender(header.column.columnDef.header, header.getContext())}
          {isSortable && (
            <span className="ml-2 inline-flex items-center justify-end">
              {getSortIcon(header.id)}
            </span>
          )}
        </span>
      </div>
      {canResize && typeof resizeHandler === "function" && (
        <div
          className="absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none bg-transparent hover:bg-primary/30"
          aria-label="Resize column"
          onMouseDown={resizeHandler}
          onTouchStart={resizeHandler}
        />
      )}
    </div>
  );
}

export default function IBaseTableUI<T = any>({
  headerGroups,
  rows,
  visibleColumns,
  loading = false,
  emptyContent = "No data available",
  classNames = {},
  tableLayout = "auto",
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

      onSortChange({
        column: columnId,
        direction: nextDirection,
      });
    },
    [sortDescriptor, onSortChange],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (active && over && active.id !== over.id) {
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
          const currentOrder = columnOrder.length
            ? columnOrder
            : headerGroups.flatMap((g) => g.headers.map((h) => h.id));
          const oldIndex = currentOrder.indexOf(active.id as string);
          const newIndex = currentOrder.indexOf(over.id as string);
          if (oldIndex !== -1 && newIndex !== -1) {
            onColumnOrderChange(arrayMove(currentOrder, oldIndex, newIndex));
          }
        }
      }
    },
    [columnOrder, headerGroups, onColumnOrderChange, setColumnOrder],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const sortableIds = useMemo(
    () =>
      columnOrder.length
        ? columnOrder
        : headerGroups.flatMap((g) => g.headers.map((h) => h.id)),
    [columnOrder, headerGroups],
  );

  const memoizedClassNames = useMemo(
    () => ({
      ...classNames,
      tbody: clsx("overflow-x-auto", classNames.tbody),
      wrapper: clsx("rounded-none p-0", classNames.wrapper),
      th: clsx(
        "px-2 py-2 text-left text-xs font-semibold uppercase tracking-wide text-foreground bg-default-100 border-b border-r border-default-200 last:border-r-0",
        classNames.th,
      ),
      tr: clsx(
        "border-b border-default-200/80 transition-colors hover:bg-default-100/80",
        classNames.tr,
      ),
      td: clsx(
        "rounded-none py-2 px-3 text-sm text-default-700",
        classNames.td,
      ),
    }),
    [classNames],
  );

  const columnMap = useMemo(
    () => new Map(visibleColumns.map((col) => [col.id, col])),
    [visibleColumns],
  );

  const tableContent = (
    <Table
      aria-label="Data table"
      classNames={memoizedClassNames}
      color={color}
      isCompact={isCompact}
      isHeaderSticky={isHeaderSticky}
      isStriped={isStriped}
      layout={tableLayout}
      selectedKeys={selectedKeys}
      selectionMode={selectionMode}
      onSelectionChange={onSelectionChange}
    >
      <TableHeader>
        {headerGroups.flatMap((headerGroup) =>
          headerGroup.headers.map((header) => {
            const column = columnMap.get(header.id);
            const meta = (column?.columnDef?.meta as Record<string, any>) || {};
            const isSortable = header.column.getCanSort();
            const isPinned = header.column.getIsPinned();
            const pinStyle = isPinned
              ? {
                  position: "sticky" as const,
                  [isPinned === "left" ? "left" : "right"]:
                    header.column.getStart(isPinned),
                  zIndex: 10,
                }
              : undefined;

            return (
              <TableColumn
                key={header.id}
                align={meta.align || "start"}
                allowsSorting={false}
                className={clsx(
                  "relative",
                  isPinned && "frozen-column",
                  isPinned === "left" && "frozen-left",
                  isPinned === "right" && "frozen-right",
                )}
                maxWidth={column?.columnDef.maxSize}
                minWidth={column?.columnDef.minSize}
                style={pinStyle}
                width={header.column.getSize()}
              >
                <TableHeaderCell
                  enableColumnOrdering={enableColumnOrdering}
                  enableColumnResizing={enableColumnResizing}
                  getSortIcon={getSortIcon}
                  header={header}
                  headerGroup={headerGroup}
                  column={column!}
                  meta={meta}
                  isSortable={isSortable}
                  onHeaderClick={handleHeaderClick}
                  renderHeader={renderHeader}
                />
              </TableColumn>
            );
          }),
        )}
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

          return (
            <TableRow key={rowKey}>
              {row.getVisibleCells().map((cell) => {
                const column = columnMap.get(cell.column.id);
                const meta =
                  (column?.columnDef?.meta as Record<string, any>) || {};
                const isPinned = cell.column.getIsPinned();
                const pinStyle = isPinned
                  ? {
                      position: "sticky" as const,
                      [isPinned === "left" ? "left" : "right"]:
                        cell.column.getStart(isPinned),
                      zIndex: 10,
                    }
                  : undefined;

                return (
                  <TableCell
                    key={cell.id}
                    className={clsx(
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
                        `justify-${meta.align || "start"}`,
                      )}
                    >
                      {renderCell
                        ? (() => {
                            const customRender = renderCell(
                              column!,
                              row,
                              cell.getValue(),
                            );

                            return customRender !== null &&
                              customRender !== undefined
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

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext
        items={sortableIds}
        strategy={horizontalListSortingStrategy}
      >
        {tableContent}
      </SortableContext>
    </DndContext>
  );
}
