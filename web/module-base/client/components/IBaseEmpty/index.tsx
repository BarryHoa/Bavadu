"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import React from "react";
import { Inbox } from "lucide-react";
import clsx from "clsx";

export interface IBaseEmptyProps {
  /** Short title above description */
  title?: ReactNode;
  /** Icon component (e.g. from lucide-react). Default: Inbox */
  icon?: LucideIcon;
  /** Optional description text below title */
  description?: ReactNode;
  /** Optional action (e.g. button or link) below description */
  children?: ReactNode;
  className?: string;
  /** Icon container size: sm (default), md, lg */
  iconSize?: "sm" | "md" | "lg";
}

const iconSizeClasses = {
  sm: "h-10 w-10",
  md: "h-12 w-12",
  lg: "h-14 w-14",
};

const iconInnerSizeClasses = {
  sm: "h-5 w-5",
  md: "h-6 w-6",
  lg: "h-7 w-7",
};

export const IBaseEmpty = React.forwardRef<HTMLDivElement, IBaseEmptyProps>(
  (
    {
      title,
      icon: Icon = Inbox,
      description,
      children,
      className,
      iconSize = "md",
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={clsx(
          "flex flex-col items-center justify-center gap-3 py-10 px-4",
          className
        )}
      >
        <div
          className={clsx(
            "flex items-center justify-center rounded-full bg-default-100 text-default-400",
            iconSizeClasses[iconSize]
          )}
        >
          <Icon aria-hidden className={iconInnerSizeClasses[iconSize]} />
        </div>
        {(title != null && title !== "") || (description != null && description !== "") ? (
          <div className="text-center space-y-1">
            {title != null && title !== "" && (
              <p className="text-base font-medium text-foreground">{title}</p>
            )}
            {description != null && description !== "" && (
              <p className="text-sm text-default-500 max-w-sm">{description}</p>
            )}
          </div>
        ) : null}
        {children}
      </div>
    );
  }
);

IBaseEmpty.displayName = "IBaseEmpty";

export default IBaseEmpty;
