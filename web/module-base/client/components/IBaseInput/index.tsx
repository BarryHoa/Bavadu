"use client";

import { Input as HeroUIInput, InputProps } from "@heroui/input";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import React from "react";

export type IBaseInputProps = Omit<InputProps, "type"> & {
  /**
   * `type="date"` is intentionally disallowed. Use `IBaseDatePicker` instead.
   */
  type?: Exclude<InputProps["type"], "date">;
};
export const IBaseInput = React.forwardRef<HTMLInputElement, IBaseInputProps>(
  (props, ref) => {
    const t = useTranslations("components.input");
    const {
      isDisabled,
      size = "sm",
      labelPlacement = "outside",
      placeholder,
      ...rest
    } = props;
    const defaultPlaceholder = t("placeholder");

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
        labelPlacement={labelPlacement}
        placeholder={placeholder ?? defaultPlaceholder}
        size={size}
        variant="bordered"
        {...rest}
        isDisabled={isDisabled}
      />
    );
  }
);

IBaseInput.displayName = "IBaseInput";

export default IBaseInput;
