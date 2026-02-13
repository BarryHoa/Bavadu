"use client";

import type { TabBarExtraContent, TabItem } from "./types";

import clsx from "clsx";
import React from "react";

import { useTabsContext } from "./TabsContext";
import { TabTrigger } from "./TabTrigger";

export interface TabListProps {
  items: TabItem[];
  tabBarExtraContent?: TabBarExtraContent;
  "aria-label"?: string;
}

export function TabList({
  items,
  tabBarExtraContent,
  "aria-label": ariaLabel,
}: TabListProps) {
  const { selectedKey, onSelect, classNames } = useTabsContext();

  const isExtraObject =
    tabBarExtraContent != null &&
    typeof tabBarExtraContent === "object" &&
    ("left" in tabBarExtraContent || "right" in tabBarExtraContent);

  const extraLeft = isExtraObject
    ? (tabBarExtraContent as { left?: React.ReactNode }).left
    : null;
  const extraRight = isExtraObject
    ? (tabBarExtraContent as { right?: React.ReactNode }).right
    : null;
  const extraSingle = !isExtraObject ? tabBarExtraContent : null;

  const hasExtra = extraLeft != null || extraRight != null || extraSingle != null;

  return (
    <div
      aria-label={ariaLabel}
      className={clsx(
        "flex items-center gap-0 overflow-x-auto border-b border-slate-200",
        hasExtra && "flex-1 min-w-0",
        classNames?.tabList,
      )}
      role="tablist"
    >
      {extraLeft != null && (
        <div className="shrink-0 mr-2 flex items-center">{extraLeft}</div>
      )}
      <div
        className={clsx(
          "flex gap-0 flex-1 min-w-0 overflow-x-auto",
          !hasExtra && "mb-0",
        )}
      >
        {items.map((item) => (
          <TabTrigger
            key={item.key}
            isSelected={item.key === selectedKey}
            item={item}
            onSelect={onSelect}
          />
        ))}
      </div>
      {(extraRight != null || extraSingle != null) && (
        <div className="shrink-0 ml-auto flex items-center pl-2">
          {(extraRight ?? extraSingle) as React.ReactNode}
        </div>
      )}
    </div>
  );
}
