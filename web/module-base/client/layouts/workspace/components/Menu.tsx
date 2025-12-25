"use client";
import { IBaseDivider, IBaseScrollShadow, IBaseTooltip } from "@base/client/components";

import { MenuWorkspaceElement } from "@base/client/interface/WorkspaceMenuInterface";
import clsx from "clsx";
import { BarChart3, Boxes, Building2, ChevronDown, ChevronRight, Circle, ClipboardList, NewspaperIcon, Package, Pin, PinOff, Settings, ShoppingCart, TrendingUp, User, type LucideIcon } from "lucide-react";
import IBaseLink from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const KEY_WORKSPACE_LAST_MENU_PATH = "last_menu_key";

const ICON_MAP: Record<string, LucideIcon> = {
  Package,
  TrendingUp,
  ClipboardList,
  ShoppingCart,
  Boxes,
  BarChart3,
  Building2,
  Settings,
  User,
  NewspaperIcon,
};

interface MenuProps {
  menuItems: MenuWorkspaceElement[];
  isOpen: boolean;
  onClose: () => void;
  onToggleSidebar?: () => void;
}

export default function Menu({
  isOpen,
  onClose,
  menuItems = [],
  onToggleSidebar,
}: MenuProps) {
  // Split menu items by type
  const mainMenus = menuItems.filter((item) => item.type === "main");
  const moduleMenus = menuItems.filter((item) => item.type === "mdl");
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isHoverOpen, setIsHoverOpen] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);

  const effectiveOpen = isOpen || isHoverOpen;

  // Memoize the flattened menu list for efficiency
  const flattenedMenus = useMemo(() => {
    return menuItems
      .flatMap((item) => {
        if (item.children && item.children.length > 0) {
          const children = item.children.flat();

          return [item, ...children];
        }

        return [item];
      })
      .sort((a: any, b: any) => {
        const lenA = (a.path || "").length;
        const lenB = (b.path || "").length;

        return lenB - lenA; // long to short
      });
  }, [menuItems]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName],
    );
  };

  const normalizePath = (value: string) => {
    if (!value) return "/";

    const withLeading = value.startsWith("/") ? value : `/${value}`;
    const trimmed = withLeading.replace(/\/+$/, "");

    return trimmed || "/";
  };

  // Tìm tất cả các item cha cần expand theo một đường dẫn bất kỳ
  const findParentItemsToExpandByPath = (
    items: MenuWorkspaceElement[],
    path: string,
  ): string[] => {
    const parentsToExpand: string[] = [];

    const checkItem = (item: MenuWorkspaceElement): boolean => {
      if (item.path && path) {
        const normalized = normalizePath(path);
        const itemPath = normalizePath(item.path);

        if (normalized === itemPath || normalized.startsWith(`${itemPath}/`)) {
          return true;
        }
      }

      if (item.children) {
        const hasActiveChild = item.children.some((child) => checkItem(child));

        if (hasActiveChild) {
          parentsToExpand.push(item.name);
        }

        return hasActiveChild;
      }

      return false;
    };

    items.forEach((item) => checkItem(item));

    return parentsToExpand;
  };

  const findKeyByPath = (
    items: MenuWorkspaceElement[],
    path: string,
  ): string | null => {
    const normalized = normalizePath(path);
    let foundKey: string | null = null;

    const checkItem = (item: MenuWorkspaceElement): boolean => {
      if (item.path) {
        const itemPath = normalizePath(item.path);

        if (normalized === itemPath || normalized.startsWith(`${itemPath}/`)) {
          foundKey = item.key;

          return true;
        }
      }

      if (item.children) {
        return item.children.some((child) => checkItem(child));
      }

      return false;
    };

    items.forEach((item) => checkItem(item));

    return foundKey;
  };

  const hasActiveChildByKey = (
    item: MenuWorkspaceElement,
    key: string | null,
  ): boolean => {
    if (!key || !item.children) return false;

    return item.children.some(
      (child) => child.key === key || hasActiveChildByKey(child, key),
    );
  };

  // Tự expand menu và highlight item đang active (ưu tiên theo pathname)
  useEffect(() => {
    const parentsToExpand: string[] = findParentItemsToExpandByPath(
      flattenedMenus,
      pathname,
    );

    const normalizedPathName = normalizePath(pathname);
    const keyToSet: string | null =
      flattenedMenus.find(
        (item) => normalizePath(item.path || "") === normalizedPathName,
      )?.key || null;

    setActiveKey(keyToSet);

    if (parentsToExpand.length > 0) {
      setExpandedItems((prev) =>
        Array.from(new Set([...prev, ...parentsToExpand])),
      );
    }
  }, [pathname, menuItems]);

  const renderIcon = (iconName: string | undefined, isHighlighted: boolean) => {
    const IconComponent = (iconName && ICON_MAP[iconName]) || Circle;

    return (
      <span
        className={clsx(
          "inline-flex h-7 w-7 items-center justify-center rounded-lg border text-[11px] flex-shrink-0",
          isHighlighted
            ? "bg-blue-600 border-blue-600 text-white shadow-sm"
            : "bg-slate-50 border-slate-200 text-slate-500 group-hover:bg-blue-50 group-hover:border-blue-200 group-hover:text-blue-500",
        )}
      >
        <IconComponent className="h-4 w-4" />
      </span>
    );
  };

  // Render menu item (workspace hoặc module)
  const renderMenuItem = (item: MenuWorkspaceElement) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const itemPath = item.path;
    const isItemActive = activeKey === item.key;
    const hasActiveChildren =
      hasChildren && hasActiveChildByKey(item, activeKey);
    const isHighlighted = isItemActive || hasActiveChildren;

    const content = (
      <button
        ref={isItemActive ? activeItemRef : null}
        aria-current={isItemActive ? "page" : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
        className={clsx(
          "group flex w-full items-center justify-between px-2 py-1 rounded-xl cursor-pointer transition-all duration-200 text-left",
          "border border-transparent",
          isHighlighted
            ? "bg-blue-50 text-blue-700 border-blue-100 shadow-[0_0_0_1px_rgba(59,130,246,0.15)]"
            : "text-slate-700 hover:bg-slate-50 hover:text-blue-600",
        )}
        type="button"
        onClick={() => {
          if (hasChildren) {
            toggleExpanded(item.name);
          }
        }}
      >
        <div className="flex items-center flex-1 gap-2">
          {renderIcon(item.icon, Boolean(isHighlighted))}
          <span
            className={clsx(
              "text-xs font-semibold tracking-wide uppercase",
              "whitespace-nowrap overflow-hidden text-ellipsis",
              "transition-all duration-300",
              effectiveOpen
                ? "opacity-100 translate-x-0 max-w-[160px]"
                : "opacity-0 -translate-x-1 max-w-0",
            )}
          >
            {item.name}
          </span>
        </div>

        {hasChildren && (
          <div
            className={clsx(
              "transition-all duration-200",
              effectiveOpen ? "opacity-100" : "opacity-0 hidden",
            )}
          >
            {isExpanded ? (
              <ChevronDown className="text-slate-400" size={14} />
            ) : (
              <ChevronRight className="text-slate-400" size={14} />
            )}
          </div>
        )}
      </button>
    );

    return (
      <div key={item.name} className="mb-1">
        {hasChildren ? (
          <>
            {effectiveOpen ? (
              content
            ) : (
              <IBaseTooltip content={item.name} placement="right">
                {content}
              </IBaseTooltip>
            )}
          </>
        ) : (
          <IBaseLink
            className="block"
            href={itemPath || "#"}
            onClick={() => {
              if (typeof window !== "undefined" && item.key) {
                window.localStorage.setItem(
                  KEY_WORKSPACE_LAST_MENU_PATH,
                  item.key,
                );
              }

              setActiveKey(item.key);

              onClose();
            }}
          >
            {effectiveOpen ? (
              content
            ) : (
              <IBaseTooltip content={item.name} placement="right">
                {content}
              </IBaseTooltip>
            )}
          </IBaseLink>
        )}

        {hasChildren && isExpanded && (
          <div
            className={clsx(
              "mt-1 ml-3 space-y-1 border-l border-slate-100 pl-3",
              "transition-all duration-200",
              effectiveOpen
                ? "opacity-100"
                : "opacity-0 max-h-0 overflow-hidden",
            )}
          >
            {item.children?.map((child) => {
              const childPath = child.path;
              const childAs = child.as;
              const isChildActive = activeKey === child.key;

              return (
                <IBaseLink
                  key={child.name}
                  as={childAs || childPath}
                  className={clsx(
                    "flex items-center justify-between rounded-lg px-2 py-1.5 text-xs transition-all duration-150",
                    isChildActive
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-blue-600",
                  )}
                  href={childPath || "#"}
                  onClick={() => {
                    if (typeof window !== "undefined" && child.key) {
                      window.localStorage.setItem(
                        KEY_WORKSPACE_LAST_MENU_PATH,
                        child.key,
                      );
                    }

                    setActiveKey(child.key);

                    onClose();
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        "transition-all duration-300 whitespace-nowrap overflow-hidden text-ellipsis",
                        effectiveOpen
                          ? "opacity-100 translate-x-0 max-w-[160px]"
                          : "opacity-0 -translate-x-1 max-w-0",
                      )}
                    >
                      {child.name}
                    </span>
                  </div>

                  {child.badge && effectiveOpen && (
                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                      {child.badge}
                    </span>
                  )}
                </IBaseLink>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        aria-label="Workspace navigation"
        className={clsx(
          "hidden lg:flex lg:flex-col flex-shrink-0 transition-all duration-300 ease-in-out",
          "bg-white/90 backdrop-blur border-r border-slate-100 shadow-sm",
          effectiveOpen ? "w-64" : "w-[4.25rem]",
        )}
        onMouseEnter={() => {
          if (!isOpen) {
            setIsHoverOpen(true);
          }
        }}
        onMouseLeave={() => {
          if (!isOpen) {
            setIsHoverOpen(false);
          }
        }}
      >
        <IBaseScrollShadow className="flex-1 px-2 pb-4 pt-2">
          {/* Header + toggle */}
          <div
            className={clsx(
              "mb-2 flex items-center gap-2 rounded-xl px-2 py-1.5",
              "bg-slate-50/80 border border-slate-100",
              effectiveOpen ? "justify-between" : "justify-center",
            )}
          >
            <div
              className={clsx(
                "flex-auto text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500",
                "transition-all duration-300 whitespace-nowrap overflow-hidden",
                effectiveOpen
                  ? "opacity-100 translate-x-0 max-w-[160px]"
                  : "opacity-0 -translate-x-1 max-w-0",
              )}
            >
              Main
            </div>

            <button
              aria-label={isOpen ? "Bỏ ghim menu" : "Ghim menu"}
              className="cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
              type="button"
              onClick={onToggleSidebar}
            >
              {isOpen ? (
                <Pin className="h-4 w-4" />
              ) : (
                <PinOff className="h-4 w-4 text-warning-500" />
              )}
            </button>
          </div>

          <div className="space-y-1">{mainMenus.map(renderMenuItem)}</div>

          {moduleMenus.length > 0 && (
            <>
              <IBaseDivider className="my-3 bg-slate-100" />
              <div className="space-y-1">{moduleMenus.map(renderMenuItem)}</div>
            </>
          )}
        </IBaseScrollShadow>
      </aside>
    </>
  );
}
