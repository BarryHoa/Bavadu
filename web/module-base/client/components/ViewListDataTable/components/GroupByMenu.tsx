"use client";

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
