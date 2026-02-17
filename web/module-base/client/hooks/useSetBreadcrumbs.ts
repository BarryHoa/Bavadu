"use client";

import type { BreadcrumbItem } from "@base/client/layouts/workspace/components/Breadcrumb";

import { useEffect } from "react";

import { useBreadcrumbs } from "@base/client/contexts/workspace";

/**
 * Set breadcrumbs for the current page. Call in page component - breadcrumbs
 * are rendered in WorkspaceLayout. Resets on unmount.
 */
export function useSetBreadcrumbs(items: BreadcrumbItem[]) {
  const { setBreadcrumbs, reset } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs(items);

    return () => {
      reset();
    };
  }, [items, setBreadcrumbs, reset]);
}
