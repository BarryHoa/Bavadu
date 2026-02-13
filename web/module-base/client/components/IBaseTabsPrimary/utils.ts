import type { TabItem } from "./types";

import React from "react";

/**
 * Parses React.Children into TabItem[] by collecting valid Tab compound components.
 * @param children - Children of IBaseTabsPrimary (expects IBaseTabPrimary elements)
 * @param tabComponent - The Tab component type to match (e.g. IBaseTabPrimary)
 */
export function getTabItemsFromChildren(
  children: React.ReactNode,
  tabComponent: React.ComponentType<any>,
): TabItem[] {
  const items: TabItem[] = [];

  React.Children.forEach(children, (child) => {
    if (
      React.isValidElement(child) &&
      child.type === tabComponent &&
      child.props
    ) {
      const p =
        (child.props as {
          key?: string;
          title?: React.ReactNode;
          children?: React.ReactNode;
          disabled?: boolean;
          icon?: React.ReactNode;
        }) ?? {};

      const k = p?.key || child?.key;

      if (k) {
        items.push({
          key: k,
          title: p.title,
          children: p.children,
          disabled: p.disabled,
          icon: p.icon,
        });
      }
    }
  });

  return items;
}
