"use client";

import { Textarea as HeroUITextarea, TextAreaProps } from "@heroui/input";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import React from "react";

export type IBaseTextareaProps = TextAreaProps & {};
export const IBaseTextarea = React.forwardRef<HTMLTextAreaElement, IBaseTextareaProps>(
  (props, ref) => {
    const t = useTranslations("components.textarea");
    const {
      isDisabled,
      size = "sm",
      labelPlacement = "outside",
      placeholder,
      minRows = 3,
      ...rest
    } = props;
    const defaultPlaceholder = t("placeholder");

    return (
      <HeroUITextarea
        ref={ref}
        classNames={{
          base: "max-w opacity-100",
          label: "text-small text-default-600",
          mainWrapper: clsx(
            "cursor-not-allowed",
            isDisabled ? "bg-default-200" : "",
          ),
          input: "placeholder:text-default-400 italic text-sm",
        }}
        labelPlacement={labelPlacement}
        minRows={minRows}
        placeholder={placeholder ?? defaultPlaceholder}
        size={size}
        variant="bordered"
        {...rest}
        isDisabled={isDisabled}
      />
    );
  },
);

IBaseTextarea.displayName = "IBaseTextarea";

export default IBaseTextarea;
