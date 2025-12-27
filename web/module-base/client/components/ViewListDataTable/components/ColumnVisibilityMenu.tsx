"use client";

import { Table } from "lucide-react";
import MiniSearch from "minisearch";
import { useState } from "react";

import {
  IBaseButton,
  IBaseCheckbox,
  IBaseDropdown,
  IBaseInputSearch,
} from "@base/client/components";

import { IBaseTableColumnDefinition } from "../../IBaseTable/IBaseTableInterface";

interface ColumnVisibilityMenuProps<T = any> {
  columns: IBaseTableColumnDefinition<T>[];
  visibleColumns: Set<string>;
  onToggleColumn: (key: string) => void;
}

export default function ColumnVisibilityMenu<T = any>({
  columns,
  visibleColumns,
  onToggleColumn,
}: ColumnVisibilityMenuProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // React Compiler will automatically optimize these expensive computations
  const toLabel = (column: IBaseTableColumnDefinition<T>) => {
    const source = column.label ?? column.title ?? column.key;

    if (typeof source === "string") return source;
    if (typeof source === "number" || typeof source === "boolean") {
      return String(source);
    }
    if (Array.isArray(source)) {
      return source
        .map((item) =>
          typeof item === "string" || typeof item === "number"
            ? String(item)
            : ""
        )
        .filter(Boolean)
        .join(" ");
    }

    return column.key.toString();
  };

  const docs = columns.map((column) => ({
    id: column.key.toString(),
    label: toLabel(column),
  }));

  const miniSearch = new MiniSearch({
    fields: ["label"],
    storeFields: ["id", "label"],
  });

  miniSearch.addAll(docs);

  const columnMap = new Map<string, IBaseTableColumnDefinition<T>>();
  columns.forEach((column) => {
    columnMap.set(column.key.toString(), column);
  });

  const term = searchTerm.trim();
  const filteredColumns = !term
    ? columns
    : (() => {
        const results = miniSearch.search(term, {
          prefix: true,
          fuzzy: 0.2,
        });

        if (results.length === 0) return [];

        return results
          .map((result) => columnMap.get(result.id))
          .filter((column): column is IBaseTableColumnDefinition<T> =>
            Boolean(column)
          );
      })();

  // React Compiler will automatically optimize this array creation
  const dropdownItems = [
    {
      key: "__search__",
      hideSelectedIcon: true,
      isReadOnly: true,
      className:
        "sticky top-0 z-10 pointer-events-auto data-[hover=true]:bg-transparent bg-content1",
      textValue: "Search columns",
      children: (
        <IBaseInputSearch
          // Avoid autoFocus for better accessibility; focus can be managed by parent if needed
          placeholder="Search columns..."
          showClearButton={false}
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
      ),
    },
    ...filteredColumns.map((col) => ({
      key: String(col.key),
      textValue:
        typeof col.label === "string"
          ? col.label
          : String(col.label ?? col.title ?? col.key),
      onPress: () => onToggleColumn(String(col.key)),
      children: (
        <IBaseCheckbox
          isReadOnly
          className="pointer-events-none"
          isSelected={visibleColumns.has(String(col.key))}
        >
          {col.label ?? col.title ?? col.key}
        </IBaseCheckbox>
      ),
    })),
  ];

  return (
    <IBaseDropdown
      closeOnSelect={false}
      isOpen={isOpen}
      items={dropdownItems}
      menu={{
        "aria-label": "Column visibility",
        className: "min-w-[220px] text-[12px] max-h-[500px] overflow-y-auto",
        itemClasses: {
          base: "py-1 px-2",
          title: "text-[12px]",
        },
      }}
      shouldCloseOnInteractOutside={() => true}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSearchTerm("");
        }
      }}
    >
      <IBaseButton
        isIconOnly
        size="sm"
        startContent={<Table size={16} />}
        title="Column visibility"
        variant="bordered"
      />
    </IBaseDropdown>
  );
}
