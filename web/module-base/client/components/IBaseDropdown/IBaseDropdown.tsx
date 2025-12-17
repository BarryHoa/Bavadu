import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  type DropdownItemProps,
  type DropdownMenuProps,
} from "@heroui/dropdown";
import clsx from "clsx";
import React from "react";

export type IBaseDropdownItem = DropdownItemProps & { key: React.Key };

export type IBaseDropdownProps<
  TItem extends IBaseDropdownItem = IBaseDropdownItem,
> = Omit<React.ComponentProps<typeof Dropdown>, "children"> & {
  /**
   * Items to render in the dropdown menu.
   */
  items?: Iterable<TItem>;
  /**
   * Trigger content. Expected to be a HeroUI `<DropdownTrigger>...</DropdownTrigger>`.
   */
  children: React.ReactNode;
  /**
   * Props forwarded to the underlying `<DropdownMenu />`.
   */
  menu?: Omit<DropdownMenuProps<TItem>, "children"> & {
    /**
     * Provide custom children for `<DropdownMenu />`. If set, it takes priority over `items` + `menu.renderItem`.
     */
    children?: DropdownMenuProps<TItem>["children"];
    /**
     * Custom item renderer (for dynamic items). If provided, you should return a `<DropdownItem />` (or compatible).
     * `key` will be auto-applied from `item.key` if missing.
     *
     * If `menu.children` is provided, it takes priority over `items` + `menu.renderItem`.
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

const IBaseDropdown = <TItem extends IBaseDropdownItem = IBaseDropdownItem>(
  props: IBaseDropdownProps<TItem>
) => {
  const { items, children, menu, ...dropdownProps } = props;
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
    // `DropdownMenu.color` only supports HeroUI semantic colors (default/primary/...)
    // If you need custom colors (e.g. Tailwind `foregroundHover`), use `itemClasses` instead.
    itemClasses: {
      ...itemClasses,
      base: hasMenuColor
        ? itemClasses.base
        : clsx(
            itemClasses.base,
            // Ensure our hover/focus styles win over HeroUI defaults
            // Use CSS var to avoid Tailwind theme token generation issues
            "data-[hover=true]:!bg-[var(--dropdown-hover)]",
            "data-[focus=true]:!bg-[var(--dropdown-hover)]",
            "data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-primary data-[focus-visible=true]:ring-offset-2 data-[focus-visible=true]:ring-offset-background"
          ),
    },
  } as DropdownMenuProps<TItem>;

  return (
    <Dropdown {...dropdownProps}>
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

export default IBaseDropdown;
