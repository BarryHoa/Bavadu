"use client";

import { Button } from "@heroui/button";
import { Drawer } from "@heroui/drawer";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuWorkspaceElement } from "@base/interface/WorkspaceMenuInterface";

interface MenuProps {
  items: MenuWorkspaceElement[];
  isOpen: boolean;
  onClose: () => void;
  moduleMenus?: MenuWorkspaceElement[];
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export default function Menu({
  items,
  isOpen,
  onClose,
  moduleMenus = [],
}: MenuProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const activeItemRef = useRef<HTMLDivElement>(null);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  const hasActiveChild = (item: MenuWorkspaceElement): boolean => {
    if (item.path && isActive(item.path)) return true;
    if (item.children) {
      return item.children.some((child) => hasActiveChild(child));
    }
    return false;
  };

  // Find all parent items that need to be expanded for the current path
  const findParentItemsToExpand = (
    items: MenuWorkspaceElement[],
    path: string
  ): string[] => {
    const parentsToExpand: string[] = [];

    const checkItem = (item: MenuWorkspaceElement): boolean => {
      if (item.path && isActive(item.path)) {
        return true;
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

  // Auto-expand menu items and scroll to active item on path change
  useEffect(() => {
    const allItems = [...items, ...moduleMenus];
    const parentsToExpand = findParentItemsToExpand(allItems, pathname);

    if (parentsToExpand.length > 0) {
      setExpandedItems((prev) => {
        const newExpanded = Array.from(new Set([...prev, ...parentsToExpand]));
        return newExpanded;
      });

      // Scroll to active item after a short delay to allow expansion
      // setTimeout(() => {
      //   if (activeItemRef.current) {
      //     activeItemRef.current.scrollIntoView({
      //       behavior: "smooth",
      //       block: "center",
      //     });
      //   }
      // }, 100);
    }
  }, [pathname, items, moduleMenus]);

  // Render menu item (workspace hoặc module)
  const renderMenuItem = (item: MenuWorkspaceElement) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const itemPath = item.path;
    const isItemActive = itemPath ? isActive(itemPath) : false;
    const hasActiveChildren = hasChildren && hasActiveChild(item);

    return (
      <div key={item.name} className="mb-1">
        <div
          ref={isItemActive ? activeItemRef : null}
          className={`flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 group ${
            isItemActive
              ? "bg-blue-50 text-blue-600"
              : hasActiveChildren
                ? "bg-blue-50 text-blue-600"
                : "hover:bg-blue-50 hover:text-blue-600 text-gray-700"
          }`}
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.name);
            }
          }}
        >
          <div className="flex items-center flex-1">
            {hasChildren ? (
              <div
                className={`flex items-center flex-1 text-sm font-medium cursor-pointer ${
                  isItemActive
                    ? "text-blue-600"
                    : "text-gray-700 group-hover:text-blue-600"
                }`}
              >
                <div className="w-5 h-5 bg-gray-300 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">
                    {item.icon.charAt(0)}
                  </span>
                </div>
                <span
                  className={`ml-3 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.name}
                </span>
              </div>
            ) : (
              <Link
                href={itemPath || "#"}
                className={`flex items-center flex-1 text-sm font-medium ${
                  isItemActive
                    ? "text-blue-600"
                    : "text-gray-700 group-hover:text-blue-600"
                }`}
                onClick={onClose}
              >
                <div className="w-5 h-5 bg-gray-300 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">
                    {item.icon.charAt(0)}
                  </span>
                </div>
                <span
                  className={`ml-3 transition-opacity duration-300 ${
                    isOpen ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            )}
          </div>
          {hasChildren && (
            <div
              className={`transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div
            className={`ml-6 py-1 space-y-1 transition-all duration-300 ${
              isOpen
                ? "opacity-100 max-h-96"
                : "opacity-0 max-h-0 overflow-hidden"
            }`}
          >
            {item.children?.map((child) => {
              const childPath = child.path;
              const childAs = child.as;
              const isChildActive = childPath && isActive(childPath);
              return (
                <div
                  key={child.name}
                  ref={isChildActive ? activeItemRef : null}
                  className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    isChildActive
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                  }`}
                >
                  <Link
                    href={childPath || "#"}
                    as={childAs || childPath}
                    className="flex items-center flex-1"
                    onClick={onClose}
                  >
                    <div className="flex items-center">
                      <div className="w-4 h-4 mr-2 bg-gray-300 rounded flex items-center justify-center">
                        <span className="text-xs font-bold">
                          {child.icon.charAt(0)}
                        </span>
                      </div>
                      <span
                        className={`transition-opacity duration-300 ${
                          isOpen ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {child.name}
                      </span>
                    </div>
                  </Link>
                  {child.badge && (
                    <span
                      className={`bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full transition-opacity duration-300 ${
                        isOpen ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {child.badge}
                    </span>
                  )}
                </div>
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
        className={`hidden lg:flex lg:flex-col bg-white shadow-xl flex-shrink-0 transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-16"
        }`}
      >
        <ScrollShadow className="flex-1 px-2 py-4">
          <div
            className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3 transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            Main
          </div>
          {items.map(renderMenuItem)}

          {moduleMenus.length > 0 && (
            <div className="mt-4">
              <div
                className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3 transition-opacity duration-300 ${
                  isOpen ? "opacity-100" : "opacity-0"
                }`}
              >
                Module
              </div>
              {moduleMenus.map(renderMenuItem)}
            </div>
          )}
        </ScrollShadow>
      </aside>

      {/* Mobile sidebar */}
      <Drawer
        isOpen={isOpen}
        onOpenChange={(open) => !open && onClose()}
        placement="left"
        size="sm"
        backdrop="opaque"
      >
        <div className="w-72 h-full bg-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between h-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-blue-600 font-bold text-lg">D</span>
              </div>
              <h1 className="text-xl font-bold text-white">Seven Admin</h1>
            </div>
            <Button
              isIconOnly
              variant="light"
              size="sm"
              className="text-white"
              onPress={onClose}
            >
              ✕
            </Button>
          </div>
          <ScrollShadow className="flex-1 px-4 py-6 space-y-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
              Main
            </div>
            {items.map(renderMenuItem)}

            {moduleMenus.length > 0 && (
              <div className="mt-4">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
                  Module
                </div>
                {moduleMenus.map(renderMenuItem)}
              </div>
            )}
          </ScrollShadow>
        </div>
      </Drawer>
    </>
  );
}
