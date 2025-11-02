"use client";

import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Checkbox } from "@heroui/checkbox";
import { EyeIcon, EyeOffIcon } from "@heroui/icons";
import { DataTableColumn } from "../../DataTable";

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
  const allVisible = visibleColumns.size === columns.length;

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          startContent={allVisible ? <EyeIcon /> : <EyeOffIcon />}
        >
          Columns
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Column visibility">
        {columns.map((col) => (
          <DropdownItem key={col.key} textValue={col.label}>
            <Checkbox
              isSelected={visibleColumns.has(col.key)}
              onValueChange={() => onToggleColumn(col.key)}
            >
              {col.label}
            </Checkbox>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
