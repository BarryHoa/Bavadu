"use client";

import { Link as HeroUILink, LinkProps as HeroUILinkProps } from "@heroui/link";
import Link, { LinkProps as NextLinkProps } from "next/link";
import React from "react";

export type IBaseLinkProps = NextLinkProps &
  Omit<HeroUILinkProps, "href" | "as"> & {
    as?: NextLinkProps["as"];
  };

// Wrapper component để kết hợp Next.js Link với HeroUI Link styling
// HeroUI Link sẽ forward tất cả props (bao gồm hrefAs nếu có) xuống component này
const NextLinkWrapper = React.forwardRef<
  HTMLAnchorElement,
  NextLinkProps & { hrefAs?: NextLinkProps["as"] }
>((props, ref) => {
  const { hrefAs, as, ...restProps } = props ?? {};

  return <Link ref={ref} as={hrefAs} {...restProps} />;
});

NextLinkWrapper.displayName = "NextLinkWrapper";

export const IBaseLink = React.forwardRef<HTMLAnchorElement, IBaseLinkProps>(
  (props, ref) => {
    const { size = "sm", href, as: hrefAs, children, ...restProps } = props;

    // Extract Next.js Link specific props + filter DOM-invalid props (e.g. textValue from React Aria)
    const {
      locale,
      prefetch,
      replace,
      scroll,
      shallow,
      textValue,
      ...heroUIProps
    } = restProps as any;

    return (
      <HeroUILink
        ref={ref}
        as={NextLinkWrapper}
        href={href}
        hrefAs={hrefAs}
        locale={locale}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        size={size}
        {...heroUIProps}
      >
        {children}
      </HeroUILink>
    );
  },
);

IBaseLink.displayName = "IBaseLink";

export default IBaseLink;
