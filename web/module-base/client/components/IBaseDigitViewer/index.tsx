import clsx from "clsx";
import React from "react";

import { formatNumber } from "../../utils/number";

export interface IBaseDigitViewerProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number | string | null | undefined;
  decimalPlaces?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;
  prefix?: string;
  suffix?: string;
  showZero?: boolean;
  fixZero?: boolean;
  emptyText?: string;
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "mono" | "bold";
}

export const IBaseDigitViewer = React.forwardRef<
  HTMLDivElement,
  IBaseDigitViewerProps
>((props, ref) => {
  const {
    value,
    decimalPlaces = 2,
    thousandSeparator = ",",
    decimalSeparator = ".",
    prefix = "",
    suffix = "",
    showZero = true,
    fixZero = true,
    emptyText = "-",
    className,
    label,
    size = "sm",
    variant = "default",
    ...rest
  } = props;

  const getDisplayValue = (): string => {
    if (value === null || value === undefined) {
      return emptyText;
    }

    const numValue =
      typeof value === "string" ? parseFloat(value) : Number(value);

    if (isNaN(numValue)) {
      return emptyText;
    }

    if (numValue === 0 && !showZero) {
      return emptyText;
    }

    const formatted = formatNumber(numValue, {
      decimalPlaces,
      thousandSeparator,
      decimalSeparator,
      fixZero,
    });

    return `${prefix}${formatted}${suffix}`;
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const variantClasses = {
    default: "text-default-900",
    mono: "font-mono text-default-900",
    bold: "font-semibold text-default-900",
  };

  // If className contains color class, don't apply default variant color
  const hasColorClass = className?.includes("text-");

  return (
    <div ref={ref} className="max-w" {...rest}>
      {label && <div className="text-small text-default-600 mb-1">{label}</div>}
      <div
        className={clsx(
          sizeClasses[size],
          !hasColorClass && variantClasses[variant],
          "opacity-100",
          className
        )}
      >
        {getDisplayValue()}
      </div>
    </div>
  );
});

IBaseDigitViewer.displayName = "IBaseDigitViewer";

export default IBaseDigitViewer;
