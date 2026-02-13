"use client";

import type { TabsContextValue } from "./types";

import { createContext, useContext } from "react";

export const IBaseTabsPrimaryContext = createContext<TabsContextValue | null>(
  null,
);

export function useTabsContext(): TabsContextValue {
  const ctx = useContext(IBaseTabsPrimaryContext);

  if (!ctx) {
    throw new Error("IBaseTabPrimary must be used inside IBaseTabsPrimary");
  }

  return ctx;
}
