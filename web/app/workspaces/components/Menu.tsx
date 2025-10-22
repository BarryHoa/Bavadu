"use client";

import { Button } from "@heroui/button";
import { Drawer } from "@heroui/drawer";
import { Link } from "@heroui/link";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItem } from "../../../lib/menu-loader";

// Interface cho menu item từ workspace
interface WorkspaceMenuItem {
  name: string;
  href: string;
  icon: string;
  badge?: string | null;
  children?: WorkspaceMenuItem[];
}

interface MenuProps {
  items: WorkspaceMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  moduleMenus?: MenuItem[];
}

export default function Menu({
  items,
  isOpen,
  onClose,
  moduleMenus = [],
}: MenuProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (itemName: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const hasActiveChild = (item: WorkspaceMenuItem | MenuItem): boolean => {
    if (isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => hasActiveChild(child));
    }
    return false;
  };

  // Render menu item (workspace hoặc module)
  const renderMenuItem = (item: WorkspaceMenuItem | MenuItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isItemActive = isActive(item.href);
    const hasActiveChildren = hasChildren && hasActiveChild(item);

    return (
      <div key={item.name} className="mb-1">
        <div
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
                <div className="w-5 h-5 mr-3 bg-gray-300 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">
                    {item.icon.charAt(0)}
                  </span>
                </div>
                <span>{item.name}</span>
              </div>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center flex-1 text-sm font-medium ${
                  isItemActive
                    ? "text-blue-600"
                    : "text-gray-700 group-hover:text-blue-600"
                }`}
                onClick={onClose}
              >
                <div className="w-5 h-5 mr-3 bg-gray-300 rounded flex items-center justify-center">
                  <span className="text-xs font-bold">
                    {item.icon.charAt(0)}
                  </span>
                </div>
                <span>{item.name}</span>
              </Link>
            )}
          </div>
          {hasChildren && (
            <div>
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-6 py-1 space-y-1">
            {item.children?.map((child) => (
              <Link
                key={child.name}
                href={child.href}
                className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                  isActive(child.href)
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-blue-50 text-gray-600 hover:text-blue-600"
                }`}
                onClick={onClose}
              >
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 bg-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs font-bold">
                      {child.icon.charAt(0)}
                    </span>
                  </div>
                  <span>{child.name}</span>
                </div>
                {child.badge && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                    {child.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-xl flex-shrink-0">
        <ScrollShadow className="flex-1 px-2 py-4">
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
