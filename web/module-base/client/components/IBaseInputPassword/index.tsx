"use client";

import type { InputProps } from "@heroui/input";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

import IBaseInput from "../IBaseInput";

export interface IBaseInputPasswordProps extends Omit<InputProps, "type"> {
  /** Placeholder khi không có giá trị */
  placeholder?: string;
}

export const IBaseInputPassword = React.forwardRef<
  HTMLInputElement,
  IBaseInputPasswordProps
>(function IBaseInputPassword(props, ref) {
  const t = useTranslations("components.input");
  const { placeholder, endContent, ...rest } = props;
  const [isVisible, setIsVisible] = useState(false);

  const toggleButton = (
    <button
      type="button"
      aria-label={isVisible ? t("hidePassword") : t("showPassword")}
      className="focus:outline-none"
      onClick={() => setIsVisible((v) => !v)}
    >
      {isVisible ? (
        <EyeOff
          className="text-default-400 pointer-events-none"
          size={20}
        />
      ) : (
        <Eye
          className="text-default-400 pointer-events-none"
          size={20}
        />
      )}
    </button>
  );

  return (
    <IBaseInput
      ref={ref}
      type={isVisible ? "text" : "password"}
      autoComplete={rest.autoComplete ?? "current-password"}
      inputMode="text"
      placeholder={placeholder ?? t("passwordPlaceholder")}
      endContent={endContent ?? toggleButton}
      {...rest}
    />
  );
});

IBaseInputPassword.displayName = "IBaseInputPassword";

export default IBaseInputPassword;
