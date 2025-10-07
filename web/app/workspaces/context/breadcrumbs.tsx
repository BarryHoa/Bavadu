"use client";

import React, { createContext, useContext, useState, useMemo } from "react";
import type { BreadcrumbItem } from "../components/Breadcrumb";

type BreadcrumbContextValue = {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  reset: () => void;
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | undefined>(
  undefined
);

export function BreadcrumbProvider({
  initial,
  children,
}: {
  initial: BreadcrumbItem[];
  children: React.ReactNode;
}) {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>(initial);

  const value = useMemo(
    () => ({
      breadcrumbs,
      setBreadcrumbs,
      reset: () => setBreadcrumbs(initial),
    }),
    [breadcrumbs, initial]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

export function useBreadcrumbs() {
  const ctx = useContext(BreadcrumbContext);
  if (!ctx) {
    throw new Error("useBreadcrumbs must be used within BreadcrumbProvider");
  }
  return ctx;
}
