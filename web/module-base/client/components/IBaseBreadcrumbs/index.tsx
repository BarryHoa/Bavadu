"use client";

import {
  BreadcrumbsProps,
  BreadcrumbItem as HeroUIBreadcrumbItem,
  Breadcrumbs as HeroUIBreadcrumbs,
} from "@heroui/breadcrumbs";
import React from "react";

export type IBaseBreadcrumbsProps = BreadcrumbsProps & {};

export const IBaseBreadcrumbs: React.FC<IBaseBreadcrumbsProps> = (props) => {
  const { size = "sm", ...rest } = props;

  return <HeroUIBreadcrumbs size={size} {...rest} />;
};

export const IBaseBreadcrumbItem = HeroUIBreadcrumbItem;

export default IBaseBreadcrumbs;
