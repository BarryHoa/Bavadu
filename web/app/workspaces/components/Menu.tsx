"use client";

import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Drawer } from "@heroui/drawer";
import { ScrollShadow } from "@heroui/scroll-shadow";

export type MenuItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | null;
};

export default function Menu({
  items,
  isOpen,
  onClose,
}: {
  items: MenuItem[];
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white shadow-xl flex-shrink-0">
        <ScrollShadow className="flex-1 px-2 py-4">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
            Main Menu
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 text-gray-700 group"
              >
                <div className="flex items-center">
                  <Icon size={20} className="mr-3 group-hover:text-blue-600" />
                  {item.name}
                </div>
                {item.badge && (
                  <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </ScrollShadow>
      </aside>

      {/* Mobile sidebar using HeroUI Drawer */}
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
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-3">
              Main Menu
            </div>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center justify-between px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 text-gray-700 group"
                  onClick={onClose}
                >
                  <div className="flex items-center">
                    <Icon
                      size={20}
                      className="mr-3 group-hover:text-blue-600"
                    />
                    {item.name}
                  </div>
                  {item.badge && (
                    <span className="bg-blue-100 text-blue-600 text-xs font-semibold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </ScrollShadow>
        </div>
      </Drawer>
    </>
  );
}
