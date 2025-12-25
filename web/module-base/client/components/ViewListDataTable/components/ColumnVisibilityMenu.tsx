"use client";
import {
  IBaseButton,
  IBaseCheckbox,
  IBaseDropdown,
  IBaseInputSearch,
} from "@base/client/components";

import { Table } from "lucide-react";
import MiniSearch from "minisearch";
import { useMemo, useState } from "react";

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

  const { miniSearch, columnMap } = useMemo(() => {
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

    const ms = new MiniSearch({
      fields: ["label"],
      storeFields: ["id", "label"],
    });

    ms.addAll(docs);

    const map = new Map<string, IBaseTableColumnDefinition<T>>();

    columns.forEach((column) => {
      map.set(column.key.toString(), column);
    });

    return { miniSearch: ms, columnMap: map };
  }, [columns]);

  const filteredColumns = useMemo(() => {
    const term = searchTerm.trim();

    if (!term) return columns;

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
  }, [columns, columnMap, miniSearch, searchTerm]);

  const dropdownItems = useMemo(() => {
    return [
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
  }, [filteredColumns, onToggleColumn, searchTerm, visibleColumns]);

  return (
    <IBaseDropdown
      closeOnSelect={false}
      isOpen={isOpen}
      shouldCloseOnInteractOutside={() => true}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSearchTerm("");
        }
      }}
      items={dropdownItems}
      menu={{
        "aria-label": "Column visibility",
        className: "min-w-[220px] text-[12px] max-h-[500px] overflow-y-auto",
        itemClasses: {
          base: "py-1 px-2",
          title: "text-[12px]",
        },
      }}
    >
      <IBaseButton
        isIconOnly
        size="sm"
        startContent={<IBaseTable size={16} />}
        title="Column visibility"
        variant="bordered"
      />
    </IBaseDropdown>
  );
}
