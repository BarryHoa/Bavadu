"use client";

import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { GroupIcon } from "@heroui/icons";

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

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered" startContent={<GroupIcon />}>
          Group by
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Group by options"
        selectedKeys={currentGroupBy ? [currentGroupBy] : []}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const selectedKey = Array.from(keys)[0] as string | undefined;
          onSelectGroupBy(selectedKey || null);
        }}
      >
        <DropdownItem key="none" textValue="(None)">
          (None)
        </DropdownItem>
        {groupByOptions.map((opt) => (
          <DropdownItem key={opt.key} textValue={opt.label}>
            {opt.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </Dropdown>
  );
}
