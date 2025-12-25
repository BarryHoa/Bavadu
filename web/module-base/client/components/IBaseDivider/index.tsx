"use client";

import { Divider as HeroUIDivider, DividerProps } from "@heroui/divider";
import React from "react";

export type IBaseDividerProps = DividerProps & {};

export const IBaseDivider = React.forwardRef<HTMLElement, IBaseDividerProps>(
  (props, ref) => {
    return <HeroUIDivider ref={ref} {...props} />;
  },
);

IBaseDivider.displayName = "IBaseDivider";

export const Divider = IBaseDivider;

export default IBaseDivider;
