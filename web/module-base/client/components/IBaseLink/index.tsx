"use client";

import { Link as HeroUILink, LinkProps as HeroUILinkProps } from "@heroui/link";
import Link, { LinkProps as NextLinkProps } from "next/link";
import React from "react";

export type IBaseLinkProps = NextLinkProps &
  Omit<HeroUILinkProps, "href" | "as"> & {
    hrefAs?: NextLinkProps["as"];
  };

// Wrapper component để kết hợp Next.js Link với HeroUI Link styling
// HeroUI Link sẽ forward tất cả props (bao gồm hrefAs nếu có) xuống component này
const NextLinkWrapper = React.forwardRef<
  HTMLAnchorElement,
  NextLinkProps & { hrefAs?: NextLinkProps["as"] }
>((props, ref) => {
  const { hrefAs, as, ...restProps } = props;

  return <Link ref={ref} as={hrefAs ?? as} {...restProps} />;
});

NextLinkWrapper.displayName = "NextLinkWrapper";

export const IBaseLink = React.forwardRef<HTMLAnchorElement, IBaseLinkProps>(
  (props, ref) => {
    const { size = "sm", hrefAs, href, children, ...restProps } = props;

    // Extract Next.js Link specific props
    const { locale, prefetch, replace, scroll, shallow, ...heroUIProps } =
      restProps as any;

    // HeroUI Link với Next.js Link component
    // Pass hrefAs vào NextLinkWrapper thông qua một cách khác
    // Vì HeroUI Link sử dụng 'as' prop để chỉ định component wrapper
    return (
      <HeroUILink
        ref={ref}
        as={NextLinkWrapper}
        href={href}
        locale={locale}
        prefetch={prefetch}
        replace={replace}
        scroll={scroll}
        shallow={shallow}
        size={size}
        {...(hrefAs ? { hrefAs } : {})}
        {...heroUIProps}
      >
        {children}
      </HeroUILink>
    );
  }
);

IBaseLink.displayName = "IBaseLink";

export default IBaseLink;
