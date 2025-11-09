"use client";

import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
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
        <Button
          variant="bordered"
          size="sm"
          startContent={<Filter size={16} />}
          title="Filter"
        />
      </DropdownTrigger>
      <DropdownMenu aria-label="Filter options" className="min-w-[150px]">
        {filterOptions.map((option) => (
          <DropdownItem key={option.label} textValue={option.label}>
            <Checkbox
              isSelected={activeFilters.has(option.label)}
              onValueChange={() => onToggleFilter(option.label)}
            >
              {option.label}
            </Checkbox>
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
