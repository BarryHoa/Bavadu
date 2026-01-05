"use client";

import { BadgeProps, Badge as HeroUIBadge } from "@heroui/badge";
import React from "react";

export type IBaseBadgeProps = BadgeProps & {};

export const IBaseBadge: React.FC<IBaseBadgeProps> = (props) => {
  const { size = "sm", variant = "flat", ...rest } = props;

  return <HeroUIBadge size={size} variant={variant} {...rest} />;
};

export default IBaseBadge;
