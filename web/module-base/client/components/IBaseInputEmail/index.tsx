"use client";

import type { InputProps } from "@heroui/input";
import { useTranslations } from "next-intl";
import React from "react";

import IBaseInput from "../IBaseInput";

export interface IBaseInputEmailProps extends Omit<InputProps, "type"> {
  /** Placeholder khi không có giá trị */
  placeholder?: string;
}

export const IBaseInputEmail = React.forwardRef<
  HTMLInputElement,
  IBaseInputEmailProps
>(function IBaseInputEmail(props, ref) {
  const t = useTranslations("components.input");
  const { placeholder, ...rest } = props;

  return (
    <IBaseInput
      ref={ref}
      type="email"
      inputMode="email"
      autoComplete="email"
      placeholder={placeholder ?? t("emailPlaceholder")}
      {...rest}
    />
  );
});

IBaseInputEmail.displayName = "IBaseInputEmail";

export default IBaseInputEmail;
