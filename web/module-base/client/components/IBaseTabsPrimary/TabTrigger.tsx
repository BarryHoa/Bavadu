"use client";

import type { TabItem } from "./types";

import clsx from "clsx";
import { memo } from "react";

import { SIZE_CLASS_MAP, VARIANT_CLASS_MAP } from "./constants";
import { useTabsContext } from "./TabsContext";

export interface TabTriggerProps {
  item: TabItem;
  isSelected: boolean;
  onSelect: (key: string) => void;
}

function TabTriggerComponent({ item, isSelected, onSelect }: TabTriggerProps) {
  const { classNames, size, variant, disabledKeys } = useTabsContext();
  const disabled = item.disabled ?? disabledKeys?.includes(item.key) ?? false;

  return (
    <button
      aria-controls={`tabpanel-${item.key}`}
      aria-selected={isSelected}
      className={clsx(
        "flex items-center justify-center shrink-0 gap-1.5 outline-none transition-colors",
        "text-slate-600 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:pointer-events-none",
        SIZE_CLASS_MAP[size],
        VARIANT_CLASS_MAP[variant],
        classNames?.tab,
      )}
      data-selected={isSelected}
      disabled={disabled}
      id={`tab-${item.key}`}
      role="tab"
      type="button"
      onClick={() => !disabled && onSelect(item.key)}
    >
      {item.icon && <span className="shrink-0">{item.icon}</span>}
      <span className={clsx("truncate max-w-[120px]", classNames?.tabContent)}>
        {item.title}
      </span>
    </button>
  );
}

export const TabTrigger = memo(TabTriggerComponent);
TabTrigger.displayName = "TabTrigger";
