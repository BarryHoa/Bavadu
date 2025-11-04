"use client";

import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Checkbox } from "@heroui/checkbox";
import { Filter } from "lucide-react";

export interface FilterOption<T = any> {
  label: string;
  filterFn: (row: T) => boolean;
}

interface FilterMenuProps<T = any> {
  filterOptions?: FilterOption<T>[];
  activeFilters: Set<string>;
  onToggleFilter: (label: string) => void;
}

export default function FilterMenu<T = any>({
  filterOptions,
  activeFilters,
  onToggleFilter,
}: FilterMenuProps<T>) {
  if (!filterOptions || filterOptions.length === 0) {
    return null;
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered" startContent={<Filter size={16} />}>
          Filters
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Filter options">
        {filterOptions.map((opt) => (
          <DropdownItem key={opt.label} textValue={opt.label}>
            <Checkbox
              isSelected={activeFilters.has(opt.label)}
              onValueChange={() => onToggleFilter(opt.label)}
            >
              {opt.label}
            </Checkbox>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
