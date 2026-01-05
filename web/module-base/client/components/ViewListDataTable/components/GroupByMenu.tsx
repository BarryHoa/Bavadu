"use client";
import { Group } from "lucide-react";

import { IBaseButton, IBaseDropdown } from "@base/client/components";

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

  // React Compiler will automatically optimize this array creation
  const menuItems = [{ key: "__none__", label: "(None)" }, ...groupByOptions];

  return (
    <IBaseDropdown
      items={menuItems.map((item) => ({
        key: item.key,
        textValue: item.label,
        children: item.label,
      }))}
      menu={{
        "aria-label": "Group by options",
        selectedKeys: currentGroupBy ? [currentGroupBy] : ["__none__"],
        selectionMode: "single",
        onSelectionChange: (keys) => {
          const selectedKey = Array.from(keys)[0] as string | undefined;

          if (!selectedKey || selectedKey === "__none__") {
            onSelectGroupBy(null);

            return;
          }
          onSelectGroupBy(selectedKey);
        },
      }}
    >
      <IBaseButton
        size="sm"
        startContent={<Group size={16} />}
        title="Group by"
        variant="bordered"
      />
    </IBaseDropdown>
  );
}
