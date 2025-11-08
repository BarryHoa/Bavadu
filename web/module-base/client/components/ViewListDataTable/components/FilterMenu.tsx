"use client";

import { Button } from "@heroui/button";
import { Dropdown, DropdownMenu, DropdownTrigger } from "@heroui/dropdown";
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
        {/* {filterOptions.map((opt) => (
          <DropdownItem key={opt.label} textValue={opt.label}>
            <Checkbox
              isSelected={activeFilters.has(opt.label)}
              onValueChange={() => onToggleFilter(opt.label)}
            >
              {opt.label}
            </Checkbox>
          </DropdownItem>
        ))} */}
      </DropdownMenu>
    </Dropdown>
  );
}
