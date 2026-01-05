"use client";

import { DividerProps, Divider as HeroUIDivider } from "@heroui/divider";
import React from "react";

export type IBaseDividerProps = DividerProps & {};

export const IBaseDivider = React.forwardRef<HTMLElement, IBaseDividerProps>(
  (props, ref) => {
    return <HeroUIDivider ref={ref} {...props} />;
  }
);

IBaseDivider.displayName = "IBaseDivider";

export default IBaseDivider;
