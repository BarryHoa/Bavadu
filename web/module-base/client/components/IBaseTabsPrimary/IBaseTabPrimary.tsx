"use client";

import type { IBaseTabPrimaryProps } from "./types";

import { forwardRef, useContext } from "react";

import { IBaseTabsPrimaryContext } from "./TabsContext";

export const IBaseTabPrimary = forwardRef<HTMLDivElement, IBaseTabPrimaryProps>(
  function IBaseTabPrimary(_props, _ref) {
    const ctx = useContext(IBaseTabsPrimaryContext);

    if (!ctx) {
      throw new Error("IBaseTabPrimary must be used inside IBaseTabsPrimary");
    }

    return null;
  },
);

IBaseTabPrimary.displayName = "IBaseTabPrimary";
