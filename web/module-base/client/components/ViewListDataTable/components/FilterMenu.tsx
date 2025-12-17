"use client";

import { Button } from "@heroui/button";
import { Checkbox } from "@heroui/checkbox";
import { Filter } from "lucide-react";

import { IBaseDropdown } from "@base/client/components";

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
    <IBaseDropdown
      items={filterOptions.map((option) => ({
        key: option.label,
        textValue: option.label,
        children: (
          <Checkbox
            isSelected={activeFilters.has(option.label)}
            onValueChange={() => onToggleFilter(option.label)}
          >
            {option.label}
          </Checkbox>
        ),
      }))}
      menu={{
        "aria-label": "Filter options",
        className: "min-w-[150px]",
      }}
    >
      <Button
        size="sm"
        startContent={<Filter size={16} />}
        title="Filter"
        variant="bordered"
      />
    </IBaseDropdown>
  );
}
