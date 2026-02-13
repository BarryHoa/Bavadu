"use client";

import type { TabItem } from "./types";

import clsx from "clsx";

import { useTabsContext } from "./TabsContext";

export interface TabPanelProps {
  items: TabItem[];
  selectedItem: TabItem | null;
  destroyInactiveTabPanel?: boolean;
}

export function TabPanel({
  items,
  selectedItem,
  destroyInactiveTabPanel = true,
}: TabPanelProps) {
  const { selectedKey, classNames } = useTabsContext();

  if (destroyInactiveTabPanel) {
    return (
      <div
        aria-labelledby={selectedItem ? `tab-${selectedItem.key}` : undefined}
        className={clsx("p-1", classNames?.panel)}
        hidden={!selectedItem}
        id={selectedItem ? `tabpanel-${selectedItem.key}` : undefined}
        role="tabpanel"
      >
        {selectedItem?.children}
      </div>
    );
  }

  return (
    <>
      {items.map((item) => {
        const isSelected = item.key === selectedKey;

        return (
          <div
            key={item.key}
            aria-labelledby={`tab-${item.key}`}
            className={clsx("p-1", classNames?.panel)}
            hidden={!isSelected}
            id={`tabpanel-${item.key}`}
            role="tabpanel"
          >
            {item.children}
          </div>
        );
      })}
    </>
  );
}
