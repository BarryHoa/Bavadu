"use client";

import type { InputProps } from "@heroui/input";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";

import IBaseInput from "../IBaseInput";

const PHONE_PREFIX = "+84";
const MAX_DIGITS = 10;

/** Chỉ giữ lại chữ số, tối đa MAX_DIGITS ký tự */
function toDigitsOnly(value: string, maxLength: number): string {
  const digits = value.replace(/\D/g, "");
  return digits.slice(0, maxLength);
}

/**
 * Format số để hiển thị: 9 số → xxx xxx xxx, 10 số → xxx xxx xxxx
 */
function formatPhoneDisplay(digits: string): string {
  const d = digits.replace(/\D/g, "").slice(0, MAX_DIGITS);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 10)}`;
}

export interface IBaseInputPhoneProps extends Omit<
  InputProps,
  "type" | "value" | "defaultValue" | "onValueChange"
> {
  /** Giá trị: chỉ phần số (tối đa 10 chữ số), không bao gồm prefix +84 */
  value?: string;
  defaultValue?: string;
  /** Gọi với phần số đã chuẩn hóa (chỉ số, tối đa 10 ký tự) */
  onValueChange?: (value: string) => void;
  /** Placeholder khi không có giá trị */
  placeholder?: string;
}

export const IBaseInputPhone = React.forwardRef<
  HTMLInputElement,
  IBaseInputPhoneProps
>(function IBaseInputPhone(props, ref) {
  const t = useTranslations("components.input");
  const {
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    placeholder,
    ...rest
  } = props;

  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState(() =>
    toDigitsOnly(defaultValue, MAX_DIGITS),
  );

  const digitsValue = isControlled
    ? toDigitsOnly(controlledValue ?? "", MAX_DIGITS)
    : internalValue;

  /** Hiển thị có khoảng trắng: 9 số xxx xxx xxx, 10 số xxx xxx xxxx */
  const displayValue = formatPhoneDisplay(digitsValue);

  const handleValueChange = useCallback(
    (raw: string) => {
      const digits = toDigitsOnly(raw, MAX_DIGITS);
      if (!isControlled) setInternalValue(digits);
      onValueChange?.(digits);
    },
    [onValueChange, isControlled],
  );

  return (
    <IBaseInput
      ref={ref}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      placeholder={placeholder ?? t("phonePlaceholder")}
      maxLength={12}
      startContent={
        <span className="text-default-400 text-sm whitespace-nowrap">
          {PHONE_PREFIX}
        </span>
      }
      value={displayValue}
      onValueChange={handleValueChange}
      {...rest}
    />
  );
});

IBaseInputPhone.displayName = "IBaseInputPhone";

export default IBaseInputPhone;
