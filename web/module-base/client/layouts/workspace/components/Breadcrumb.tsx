"use client";

import { ChevronRight } from "lucide-react";

import { IBaseBreadcrumbItem, IBaseBreadcrumbs } from "@base/client/components";
import { useBreadcrumbs } from "@base/client/contexts/workspace";

export type BreadcrumbItem = {
  label: string;
  /** Optional: omit for current page (not a link) */
  href?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

export default function Breadcrumb({ items }: { items?: BreadcrumbItem[] }) {
  const ctx = useBreadcrumbs();
  const data = items ?? ctx.breadcrumbs;

  if (!data.length) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="px-2 py-1.5"
    >
      <IBaseBreadcrumbs
        itemClasses={{
          base: "gap-1",
          separator: "text-default-400",
          item: "text-sm font-normal text-default-500",
        }}
        separator={<ChevronRight aria-hidden className="text-default-400 mx-0" size={14} />}
      >
        {data.map((item, index) => (
          <IBaseBreadcrumbItem
            key={`${item.label}-${index}`}
            className={item.href ? "hover:text-foreground transition-colors" : "font-medium text-foreground"}
            href={item.href}
            startContent={
              item.icon ? <item.icon className="mr-1" size={14} /> : undefined
            }
          >
            {item.label}
          </IBaseBreadcrumbItem>
        ))}
      </IBaseBreadcrumbs>
    </nav>
  );
}
