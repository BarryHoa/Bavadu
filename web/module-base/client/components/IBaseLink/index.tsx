"use client";

import { Link as HeroUILink, LinkProps } from "@heroui/link";
import React from "react";

export type IBaseLinkProps = LinkProps & {};

export const IBaseLink = React.forwardRef<HTMLAnchorElement, IBaseLinkProps>(
  (props, ref) => {
    const { size = "sm", ...rest } = props;

    return <HeroUILink ref={ref} size={size} {...rest} />;
  }
);

IBaseLink.displayName = "IBaseLink";

export type { LinkProps };
export const Link = IBaseLink;

export default IBaseLink;
