"use client";

import {
  ScrollShadow as HeroUIScrollShadow,
  ScrollShadowProps,
} from "@heroui/scroll-shadow";
import React from "react";

export type IBaseScrollShadowProps = ScrollShadowProps & {};

export const IBaseScrollShadow: React.FC<IBaseScrollShadowProps> = (props) => {
  return <HeroUIScrollShadow {...props} />;
};

export default IBaseScrollShadow;
