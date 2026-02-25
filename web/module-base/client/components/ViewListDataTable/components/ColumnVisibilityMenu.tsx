"use client";

import { Table } from "lucide-react";
import MiniSearch from "minisearch";
import { useMemo, useState } from "react";

import {
  IBaseButton,
  IBaseCheckbox,
  IBaseDropdown,
  IBaseInputSearch,
} from "@base/client/components";

import {
  I_BASE_TABLE_COLUMN_KEY_ACTION,
  I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
  IBaseTableColumnDefinition,
} from "../../IBaseTable/IBaseTableInterface";

interface ColumnVisibilityMenuProps<T = any> {
  columns: IBaseTableColumnDefinition<T>[];
  excludeKeys: string[];
  visibleColumns: Set<string>;
  onToggleColumn: (key: string) => void;
}

// React Compiler will automatically optimize these expensive computations
const toLabel = <T = any,>(column: IBaseTableColumnDefinition<T>) => {
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
          : "",
      )
      .filter(Boolean)
      .join(" ");
  }

  return column.key.toString();
};

export default function ColumnVisibilityMenu<T = any>({
  columns,
  excludeKeys,
  visibleColumns,
  onToggleColumn,
}: ColumnVisibilityMenuProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const docs = useMemo(() => {
    const excluded: string[] = [
      ...excludeKeys,
      I_BASE_TABLE_COLUMN_KEY_ACTION,
      I_BASE_TABLE_COLUMN_KEY_ROW_NUMBER,
    ];

    return columns
      .filter((column) => !excluded.includes(column.key.toString()))
      .map((column) => ({
        id: column.key.toString(),
        label: toLabel(column),
      }));
  }, [columns, excludeKeys]);

  const miniSearch = useMemo(() => {
    const miniInstance = new MiniSearch({
      fields: ["label"],
      storeFields: ["id", "label"],
    });

    miniInstance.addAll(docs);

    return miniInstance;
  }, [docs]);

  const filteredColumns = useMemo(() => {
    const term = searchTerm.trim();

    if (!term) return docs;
    const results = miniSearch.search(term, {
      prefix: true,
      fuzzy: 0.2,
    });

    if (results.length === 0) return [];

    return results.filter((column): column is { id: string; label: string } =>
      Boolean(column),
    );
  }, [searchTerm, miniSearch, docs]);

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
      key: col.id,
      textValue: col.label,
      onPress: () => onToggleColumn(col.id),
      children: (
        <IBaseCheckbox
          isReadOnly
          className="pointer-events-none"
          isSelected={visibleColumns.has(col.id)}
        >
          {col.label}
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
