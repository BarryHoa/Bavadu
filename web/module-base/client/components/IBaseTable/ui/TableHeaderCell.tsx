"use client";

import type { Header, HeaderGroup } from "@tanstack/react-table";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { flexRender } from "@tanstack/react-table";
import clsx from "clsx";
import { GripVertical } from "lucide-react";
import { memo } from "react";

import { alignClassMap } from "./constants";
import type { TableHeaderCellProps } from "../types/IBaseTableUI.types";

function TableHeaderCellInner<T = any>({
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
}: TableHeaderCellProps<T>) {
  const isDraggable =
    enableColumnOrdering && (meta?.isDraggable as boolean) !== false;
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
      disabled: !isDraggable,
    });

  const resizeHandler = header.getResizeHandler?.();
  const canResize =
    enableColumnResizing && header.column.getCanResize?.() && resizeHandler;
  const alignClass =
    alignClassMap[(meta.align as keyof typeof alignClassMap) ?? "start"] ??
    "justify-start";

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
        transform: isDragging ? CSS.Translate.toString(transform) : undefined,
        transition: isDragging ? "none" : undefined,
        whiteSpace: "nowrap" as const,
        width: header.column.getSize(),
        minWidth: header.column.getSize(),
        willChange: isDragging ? "transform" : undefined,
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
            aria-hidden
            className="mr-1.5 inline-flex cursor-grab touch-none items-center text-default-400 opacity-0 transition-opacity group-hover:opacity-100 hover:text-default-600 active:cursor-grabbing"
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
          aria-label="Resize column"
          className="absolute right-0 top-0 z-20 h-full w-2 shrink-0 cursor-col-resize select-none touch-none bg-transparent hover:bg-primary/50"
          style={{ touchAction: "none" }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resizeHandler(e.nativeEvent ?? e);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            resizeHandler(e.nativeEvent ?? e);
          }}
        />
      )}
    </div>
  );
}

export const TableHeaderCell = memo(
  TableHeaderCellInner,
) as typeof TableHeaderCellInner;
