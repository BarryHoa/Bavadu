"use client";

import { Pagination as HeroUIPagination, PaginationProps } from "@heroui/pagination";
import React from "react";

export type IBasePaginationProps = PaginationProps & {};

export const IBasePagination: React.FC<IBasePaginationProps> = (props) => {
  const { size = "sm", variant = "flat", ...rest } = props;

  return <HeroUIPagination size={size} variant={variant} {...rest} />;
};

export default IBasePagination;
