"use client";

import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Table } from "lucide-react";
import MiniSearch from "minisearch";
import { useMemo, useState } from "react";
import { DataTableColumn } from "../../DataTable";
import { IBaseInput } from "@base/client/components";

interface ColumnVisibilityMenuProps<T = any> {
  columns: DataTableColumn<T>[];
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
    const toLabel = (column: DataTableColumn<T>) => {
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

    const map = new Map<string, DataTableColumn<T>>();
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
      .filter((column): column is DataTableColumn<T> => Boolean(column));
  }, [columns, columnMap, miniSearch, searchTerm]);

  const handleToggleColumn = (key: string | number) => {
    if (key === "__search__") return;
    onToggleColumn(String(key));
  };

  return (
    <Dropdown
      isOpen={isOpen}
      closeOnSelect={false}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setSearchTerm("");
        }
      }}
      shouldCloseOnInteractOutside={() => true}
    >
      <DropdownTrigger>
        <Button
          isIconOnly
          variant="bordered"
          size="sm"
          startContent={<Table size={16} />}
          title="Column visibility"
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Column visibility"
        className="min-w-[220px] text-[12px] max-h-[500px] overflow-y-auto"
        itemClasses={{
          base: "py-1 px-2",
          title: "text-[12px]",
        }}
      >
        <DropdownItem
          key="__search__"
          isReadOnly
          hideSelectedIcon
          textValue="Search columns"
          className="sticky top-0 z-10 pointer-events-auto data-[hover=true]:bg-transparent bg-content1"
        >
          <IBaseInput
            autoFocus
            value={searchTerm}
            onValueChange={setSearchTerm}
            placeholder="Search columns..."
          />
        </DropdownItem>
        {
          filteredColumns.map((col) => (
            <DropdownItem
              key={col.key}
              onPress={() => handleToggleColumn(col.key)}
              textValue={
                typeof col.label === "string"
                  ? col.label
                  : String(col.label ?? col.title ?? col.key)
              }
            >
              <Checkbox
                isSelected={visibleColumns.has(col.key)}
                isReadOnly
                className="pointer-events-none"
              >
                {col.label ?? col.title ?? col.key}
              </Checkbox>
            </DropdownItem>
          )) as any
        }
      </DropdownMenu>
    </Dropdown>
  );
}
