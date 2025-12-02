"use client";

import { Input as HeroUIInput, InputProps } from "@heroui/input";
import clsx from "clsx";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

export type IBaseInputSearchProps = InputProps & {
  showClearButton?: boolean;
};

const IBaseInputSearch = React.forwardRef<
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
    () => <Search size={16} className="text-default-400" />,
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
          type="button"
          onClick={() => onValueChange?.("")}
          className="outline-none focus:outline-none hover:opacity-70 transition-opacity cursor-pointer"
          aria-label="Clear search"
        >
          <X size={16} className="text-default-400" />
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
      variant="bordered"
      size={size}
      labelPlacement={labelPlacement}
      placeholder={placeholder ?? defaultPlaceholder}
      startContent={rest.startContent ?? searchIcon}
      endContent={endContent}
      value={value}
      onValueChange={onValueChange}
      {...rest}
      isDisabled={isDisabled}
    />
  );
});

IBaseInputSearch.displayName = "IBaseInputSearch";

export default IBaseInputSearch;
