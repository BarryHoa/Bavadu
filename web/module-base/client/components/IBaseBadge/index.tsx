"use client";

import { Badge as HeroUIBadge, BadgeProps } from "@heroui/badge";
import React from "react";

export type IBaseBadgeProps = BadgeProps & {};

export const IBaseBadge: React.FC<IBaseBadgeProps> = (props) => {
  const { size = "sm", variant = "flat", ...rest } = props;

  return <HeroUIBadge size={size} variant={variant} {...rest} />;
};

export default IBaseBadge;
