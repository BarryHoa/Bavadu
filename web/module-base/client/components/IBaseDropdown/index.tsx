"use client";

import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  type DropdownItemProps,
  type DropdownMenuProps,
  type DropdownProps,
} from "@heroui/dropdown";
import clsx from "clsx";
import React from "react";

export type IBaseDropdownItem = DropdownItemProps & { key: React.Key };

export type IBaseDropdownProps<
  TItem extends IBaseDropdownItem = IBaseDropdownItem,
> = Omit<DropdownProps, "children"> & {
  /**
   * Items to render in the dropdown menu. If provided, the component acts as a wrapper
   * automatically rendering DropdownTrigger and DropdownMenu.
   */
  items?: Iterable<TItem>;
  /**
   * Content. If `items` is provided, this is treated as the trigger content.
   * If `items` is NOT provided, this should contain standard HeroUI children (Trigger and Menu).
   */
  children: React.ReactNode;
  /**
   * Props forwarded to the underlying `<DropdownMenu />`. Only used in wrapper mode (when `items` is provided).
   */
  menu?: Omit<DropdownMenuProps<TItem>, "children"> & {
    /**
     * Provide custom children for `<DropdownMenu />`. If set, it takes priority over `items` + `menu.renderItem`.
     */
    children?: DropdownMenuProps<TItem>["children"];
    /**
     * Custom item renderer (for dynamic items). If provided, you should return a `<DropdownItem />` (or compatible).
     * `key` will be auto-applied from `item.key` if missing.
     */
    renderItem?: (item: TItem) => React.ReactNode;
  };
};

const getTextValue = (item: IBaseDropdownItem) =>
  item.textValue ??
  (typeof item.title === "string"
    ? item.title
    : typeof item.children === "string"
      ? item.children
      : String(item.key));

/**
 * IBaseDropdown is a wrapper around HeroUI Dropdown.
 * It supports two modes:
 * 1. Wrapper mode: provide `items` and optionally `menu`. The first child will be used as the trigger.
 * 2. Standard mode: provide standard HeroUI Dropdown children (Trigger and Menu).
 */
export const IBaseDropdown = <
  TItem extends IBaseDropdownItem = IBaseDropdownItem,
>(
  props: IBaseDropdownProps<TItem>
) => {
  const { items, children, menu, ...dropdownProps } = props;

  // If no items provided and no menu config, act as a standard Dropdown wrapper
  if (!items && !menu) {
    return (
      <Dropdown {...(dropdownProps as DropdownProps)}>
        {children as any}
      </Dropdown>
    );
  }

  const {
    renderItem,
    items: menuItems,
    children: menuChildren,
    ...menuProps
  } = (menu ?? {}) as DropdownMenuProps<TItem> & {
    renderItem?: (item: TItem) => React.ReactNode;
  };

  const itemClasses = (menuProps as any)?.itemClasses ?? {};
  const hasMenuColor = (menuProps as any)?.color != null;

  const menuPropsMerged = {
    variant: "flat",
    ...(menuProps ?? {}),
    itemClasses: {
      ...itemClasses,
      base: hasMenuColor
        ? itemClasses.base
        : clsx(
            itemClasses.base,
            "data-[hover=true]:!bg-[var(--dropdown-hover)]",
            "data-[focus=true]:!bg-[var(--dropdown-hover)]",
            "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-primary data-[focus-visible=true]:ring-offset-2 data-[focus-visible=true]:ring-offset-background"
          ),
    },
  } as DropdownMenuProps<TItem>;

  return (
    <Dropdown {...(dropdownProps as DropdownProps)}>
      <DropdownTrigger>{children}</DropdownTrigger>
      {menuChildren != null ? (
        typeof menuChildren === "function" ? (
          <DropdownMenu
            {...menuPropsMerged}
            items={(menuItems ?? items) as any}
          >
            {menuChildren as any}
          </DropdownMenu>
        ) : (
          <DropdownMenu {...menuPropsMerged}>
            {menuChildren as any}
          </DropdownMenu>
        )
      ) : (
        <DropdownMenu {...menuPropsMerged} items={(menuItems ?? items) as any}>
          {
            ((item: TItem, index: number) => {
              const node = renderItem
                ? renderItem(item)
                : (() => {
                    const { children: itemChildren, ...itemProps } =
                      item as unknown as IBaseDropdownItem;

                    return (
                      <DropdownItem
                        {...(itemProps as any)}
                        key={item.key ?? String(index)}
                        textValue={getTextValue(item as any)}
                      >
                        {itemChildren}
                      </DropdownItem>
                    );
                  })();

              if (React.isValidElement(node) && node.key == null) {
                return React.cloneElement(node, {
                  key: (item as unknown as IBaseDropdownItem).key,
                } as never);
              }

              return node as never;
            }) as any
          }
        </DropdownMenu>
      )}
    </Dropdown>
  );
};

export const IBaseDropdownTrigger = DropdownTrigger;
export const IBaseDropdownMenu = DropdownMenu;
export const IBaseDropdownItem = DropdownItem;
export const IBaseDropdownSection = DropdownSection;

export default IBaseDropdown;
