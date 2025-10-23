"use client";

import {
  BreadcrumbItem as HeroBreadcrumbItem,
  Breadcrumbs as HeroBreadcrumbs,
} from "@heroui/breadcrumbs";
import { ChevronRight } from "lucide-react";
import { useBreadcrumbs } from "@base/contexts/workspace";

export type BreadcrumbItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

export default function Breadcrumb({ items }: { items?: BreadcrumbItem[] }) {
  const ctx = useBreadcrumbs();
  const data = items ?? ctx.breadcrumbs;
  return (
    <HeroBreadcrumbs
      itemClasses={{
        base: "gap-1 ",
        separator: "text-default-400",
        item: "text-xs font-medium text-default-500 hover:text-default-700",
      }}
      separator={<ChevronRight size={12} className="text-gray-400 mx-0" />}
    >
      {data.map((item) => (
        <HeroBreadcrumbItem
          key={item.href}
          href={item.href}
          startContent={
            item.icon ? <item.icon size={16} className="mr-1" /> : undefined
          }
        >
          {item.label}
        </HeroBreadcrumbItem>
      ))}
    </HeroBreadcrumbs>
  );
}
