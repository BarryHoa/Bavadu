"use client";

import { Input as HeroUIInput, InputProps } from "@heroui/input";
import clsx from "clsx";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

export type IBaseInputSearchProps = InputProps & {
  showClearButton?: boolean;
};

export const IBaseInputSearch = React.forwardRef<
  HTMLInputElement,
  IBaseInputSearchProps
>((props, ref) => {
  const t = useTranslations("components.input");
  const {
    isDisabled,
    size = "sm",
    labelPlacement = "outside",
    placeholder,
    showClearButton = true,
    value,
    onValueChange,
    ...rest
  } = props;

  const defaultPlaceholder = t("searchPlaceholder");

  // Memoize search icon to prevent recreation
  const searchIcon = useMemo(
    () => <Search className="text-default-400" size={16} />,
    []
  );

  // Handle clear button - show when there's a value and showClearButton is true
  const endContent = useMemo(() => {
    const hasValue = value && value !== "";
    const shouldShowClear = showClearButton && hasValue;

    // If custom endContent is provided, use it
    if (rest.endContent) {
      return rest.endContent;
    }

    // Show clear button if enabled and has value
    if (shouldShowClear) {
      return (
        <button
          aria-label="Clear search"
          className="outline-none focus:outline-none hover:opacity-70 transition-opacity cursor-pointer"
          type="button"
          onClick={() => onValueChange?.("")}
        >
          <X className="text-default-400" size={16} />
        </button>
      );
    }

    return undefined;
  }, [showClearButton, value, onValueChange, rest.endContent]);

  return (
    <HeroUIInput
      ref={ref}
      classNames={{
        base: "max-w opacity-100",
        label: "text-small text-default-600",
        mainWrapper: clsx(
          "cursor-not-allowed",
          isDisabled ? "bg-default-200" : ""
        ),
        input: "placeholder:text-default-400 italic text-sm",
      }}
      endContent={endContent}
      labelPlacement={labelPlacement}
      placeholder={placeholder ?? defaultPlaceholder}
      size={size}
      startContent={rest.startContent ?? searchIcon}
      value={value}
      variant="bordered"
      onValueChange={onValueChange}
      {...rest}
      isDisabled={isDisabled}
    />
  );
});

IBaseInputSearch.displayName = "IBaseInputSearch";

export default IBaseInputSearch;
