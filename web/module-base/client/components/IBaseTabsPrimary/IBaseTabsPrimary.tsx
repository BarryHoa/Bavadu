"use client";

import type { IBaseTabsPrimaryProps, TabItem } from "./types";

import clsx from "clsx";
import { forwardRef, useMemo } from "react";

import { useTabsState } from "./hooks/useTabsState";
import { IBaseTabPrimary } from "./IBaseTabPrimary";
import { TabList } from "./TabList";
import { TabPanel } from "./TabPanel";
import { IBaseTabsPrimaryContext } from "./TabsContext";
import { getTabItemsFromChildren } from "./utils";

export const IBaseTabsPrimary = forwardRef<
  HTMLDivElement,
  IBaseTabsPrimaryProps
>(function IBaseTabsPrimary(
  {
    selectedKey: selectedKeyProp,
    defaultSelectedKey,
    onSelectionChange,
    items: itemsProp,
    children,
    size = "md",
    variant = "bordered",
    placement = "top",
    disabledKeys,
    classNames,
    className,
    "aria-label": ariaLabel,
    tabBarExtraContent,
    destroyInactiveTabPanel = true,
  },
  ref,
) {
  const tabItems = useMemo<TabItem[]>(() => {
    if (itemsProp != null && itemsProp.length > 0) return itemsProp;

    return getTabItemsFromChildren(children, IBaseTabPrimary);
  }, [itemsProp, children]);

  const firstKey = tabItems[0]?.key ?? null;

  const { effectiveKey, onSelect } = useTabsState({
    selectedKey: selectedKeyProp,
    defaultSelectedKey,
    onSelectionChange,
    firstKey,
  });

  const selectedItem = tabItems.find((t) => t.key === effectiveKey) ?? null;

  const contextValue = useMemo(
    () => ({
      selectedKey: effectiveKey,
      onSelect,
      classNames,
      size,
      variant,
      placement,
      disabledKeys,
    }),
    [
      effectiveKey,
      onSelect,
      classNames,
      size,
      variant,
      placement,
      disabledKeys,
    ],
  );

  return (
    <IBaseTabsPrimaryContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={clsx("w-full mb-0", classNames?.base, className)}
      >
        <TabList
          aria-label={ariaLabel}
          items={tabItems}
          tabBarExtraContent={tabBarExtraContent}
        />
        <TabPanel
          destroyInactiveTabPanel={destroyInactiveTabPanel}
          items={tabItems}
          selectedItem={selectedItem}
        />
      </div>
    </IBaseTabsPrimaryContext.Provider>
  );
});

IBaseTabsPrimary.displayName = "IBaseTabsPrimary";

export default IBaseTabsPrimary;
