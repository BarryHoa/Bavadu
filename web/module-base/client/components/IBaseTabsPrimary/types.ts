import type { ReactNode } from "react";

export type TabsSize = "sm" | "md" | "lg";
export type TabsVariant = "bordered" | "underlined" | "solid" | "light";
export type TabsPlacement = "top" | "bottom" | "start" | "end";

export interface TabItem {
  key: string;
  title: ReactNode;
  children: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

export interface TabsClassNames {
  base?: string;
  tabList?: string;
  tab?: string;
  tabContent?: string;
  panel?: string;
}

export interface TabsContextValue {
  selectedKey: string | null;
  onSelect: (key: string) => void;
  classNames?: TabsClassNames;
  size: TabsSize;
  variant: TabsVariant;
  placement: TabsPlacement;
  disabledKeys?: React.Key[];
}

export interface IBaseTabPrimaryProps {
  /** Unique key for this tab (used for selection) */
  key: string;
  /** Label shown in the tab button */
  title: ReactNode;
  /** Content of the tab panel */
  children: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Optional icon shown in the tab */
  icon?: ReactNode;
}

/**
 * Extra content in the tab bar (Antd-style).
 * - Pass a single ReactNode to show it on the right (e.g. actions, filters).
 * - Pass { left?, right? } to place content on both sides.
 */
export type TabBarExtraContent =
  | ReactNode
  | { left?: ReactNode; right?: ReactNode };

export interface IBaseTabsPrimaryProps {
  /** Controlled selected key */
  selectedKey?: React.Key;
  /** Uncontrolled default selected key */
  defaultSelectedKey?: React.Key;
  /** Called when selection changes */
  onSelectionChange?: (key: React.Key) => void;
  /** Tab items (when provided, takes precedence over children) */
  items?: TabItem[];
  /** Compound tab children (IBaseTabPrimary) */
  children?: ReactNode;
  /** Size of tabs */
  size?: TabsSize;
  /** Visual variant */
  variant?: TabsVariant;
  /** Placement of the tab list */
  placement?: TabsPlacement;
  /** Keys of disabled tabs */
  disabledKeys?: React.Key[];
  /** Custom class names for slots */
  classNames?: TabsClassNames;
  className?: string;
  /** Accessibility label for the tab list */
  "aria-label"?: string;
  /** Extra content in tab bar (Antd-style). Single node = right side; or { left?, right? } for both sides */
  tabBarExtraContent?: TabBarExtraContent;
  /** Whether to destroy inactive panel content (HeroUI-style) */
  destroyInactiveTabPanel?: boolean;
}
