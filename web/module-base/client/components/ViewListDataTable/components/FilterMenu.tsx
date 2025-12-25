"use client";
import { IBaseButton, IBaseCheckbox, IBaseDropdown } from "@base/client/components";

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
    <IBaseDropdown
      items={filterOptions.map((option) => ({
        key: option.label,
        textValue: option.label,
        children: (
          <IBaseCheckbox
            isSelected={activeFilters.has(option.label)}
            onValueChange={() => onToggleFilter(option.label)}
          >
            {option.label}
          </IBaseCheckbox>
        ),
      }))}
      menu={{
        "aria-label": "Filter options",
        className: "min-w-[150px]",
      }}
    >
      <IBaseButton
        size="sm"
        startContent={<Filter size={16} />}
        title="Filter"
        variant="bordered"
      />
    </IBaseDropdown>
  );
}
