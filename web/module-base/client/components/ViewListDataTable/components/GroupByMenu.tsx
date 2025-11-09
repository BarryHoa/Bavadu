"use client";

import { useMemo } from "react";

import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import { Group } from "lucide-react";

export interface GroupOption {
  key: string;
  label: string;
}

interface GroupByMenuProps {
  groupByOptions: GroupOption[];
  currentGroupBy: string | null;
  onSelectGroupBy: (key: string | null) => void;
}

export default function GroupByMenu({
  groupByOptions,
  currentGroupBy,
  onSelectGroupBy,
}: GroupByMenuProps) {
  if (!groupByOptions || groupByOptions.length === 0) {
    return null;
  }

  const menuItems = useMemo(
    () => [{ key: "__none__", label: "(None)" }, ...groupByOptions],
    [groupByOptions]
  );

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          variant="bordered"
          size="sm"
          startContent={<Group size={16} />}
          title="Group by"
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Group by options"
        selectedKeys={currentGroupBy ? [currentGroupBy] : ["__none__"]}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string | undefined;
          if (!selectedKey || selectedKey === "__none__") {
            onSelectGroupBy(null);
            return;
          }
          onSelectGroupBy(selectedKey);
        }}
        items={menuItems}
      >
        {(item) => (
          <DropdownItem key={item.key} textValue={item.label}>
            {item.label}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
