"use client";

import { BreadcrumbItem as HeroUIBreadcrumbItem, Breadcrumbs as HeroUIBreadcrumbs, BreadcrumbsProps } from "@heroui/breadcrumbs";
import React from "react";

export type IBaseBreadcrumbsProps = BreadcrumbsProps & {};

export const IBaseBreadcrumbs: React.FC<IBaseBreadcrumbsProps> = (props) => {
  const { size = "sm", ...rest } = props;

  return <HeroUIBreadcrumbs size={size} {...rest} />;
};

const IBaseBreadcrumbItem = HeroUIBreadcrumbItem;

export { IBaseBreadcrumbItem };

export default IBaseBreadcrumbs;
