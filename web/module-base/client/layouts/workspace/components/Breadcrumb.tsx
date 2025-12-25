"use client";

import { IBaseBreadcrumbItem, IBaseBreadcrumbs } from "@base/client/components";
import { useBreadcrumbs } from "@base/client/contexts/workspace";
import { ChevronRight } from "lucide-react";

export type IBaseBreadcrumbItem = {
  label: string;
  href: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
};

export default function Breadcrumb({ items }: { items?: IBaseBreadcrumbItem[] }) {
  const ctx = useBreadcrumbs();
  const data = items ?? ctx.breadcrumbs;

  return (
    <IBaseBreadcrumbs
      itemClasses={{
        base: "gap-1 ",
        separator: "text-default-400",
        item: "text-xs font-normal text-default-500 hover:text-default-700",
      }}
      separator={<ChevronRight className="text-gray-400 mx-0" size={12} />}
    >
      {data.map((item) => (
        <IBaseBreadcrumbItem
          key={item.href}
          className={`${item.href ? "hover:red" : ""} ${data[data.length - 1] !== item ? "italic" : ""}`}
          href={item.href}
          startContent={
            item.icon ? <item.icon className="mr-1" size={16} /> : undefined
          }
        >
          {item.label}
        </IBaseBreadcrumbItem>
      ))}
    </IBaseBreadcrumbs>
  );
}
