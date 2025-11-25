import { InputProps } from "@heroui/input";
import clsx from "clsx";
import React, { useCallback, useMemo, useState } from "react";
import { formatNumber } from "../../utils/number";
import IBaseInput from "../IBaseInput";
import IBaseTooltip from "../IBaseTooltip";

export interface IBaseInputNumberProps
  extends Omit<InputProps, "onValueChange" | "value" | "defaultValue"> {
  value?: number | null;
  defaultValue?: number | null;
  onValueChange?: (value: number | null) => void;
  decimalPlaces?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;
  allowNegative?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  fixZero?: boolean;
}

const IBaseInputNumber = React.forwardRef<
  HTMLInputElement,
  IBaseInputNumberProps
>((props, ref) => {
  const {
    value: controlledValue,
    defaultValue,
    onValueChange,
    decimalPlaces = 0,
    thousandSeparator = ",",
    decimalSeparator = ".",
    allowNegative = true,
    min,
    max,
    placeholder = "Nhập số...",
    fixZero = true,
    ...rest
  } = props;

  const [internalValue, setInternalValue] = useState<number | null>(
    defaultValue ?? null
  );
  const [isFocused, setIsFocused] = useState(false);
  const [inputValue, setInputValue] = useState<string>("");

  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Helper: Format number to display string
  const getDisplayValue = useCallback(
    (num: number | null): string => {
      if (num === null || num === undefined) return "";
      return formatNumber(num, {
        decimalPlaces,
        thousandSeparator,
        decimalSeparator,
        fixZero,
      });
    },
    [decimalPlaces, thousandSeparator, decimalSeparator, fixZero]
  );

  // Helper: Clean input string for parsing
  const cleanInputString = useCallback(
    (str: string): string => {
      if (!str?.trim()) return "";

      let cleaned = str
        .replace(new RegExp(`\\${thousandSeparator}`, "g"), "")
        .replace(/[^\d.-]/g, "");

      if (decimalSeparator !== ".") {
        cleaned = cleaned.replace(
          new RegExp(`\\${decimalSeparator}`, "g"),
          "."
        );
      }

      if (!allowNegative) {
        cleaned = cleaned.replace(/-/g, "");
      }

      return cleaned;
    },
    [thousandSeparator, decimalSeparator, allowNegative]
  );

  // Helper: Parse string to number (without enforcing min/max)
  const parseToNumber = useCallback(
    (str: string): number | null => {
      const cleaned = cleanInputString(str);
      if (!cleaned) return null;

      const parsed = parseFloat(cleaned);
      if (isNaN(parsed)) return null;

      if (decimalPlaces >= 0) {
        return Number(parsed.toFixed(decimalPlaces));
      }

      return parsed;
    },
    [cleanInputString, decimalPlaces]
  );

  // Helper: Get raw value without formatting (for focused state)
  const getRawValue = useCallback(
    (num: number | null): string => {
      if (num === null || num === undefined) return "";

      if (decimalPlaces > 0) {
        const formatted = num.toFixed(decimalPlaces);
        if (formatted.includes(".")) {
          return formatted.replace(/\.?0+$/, "");
        }
        return formatted;
      }

      return num.toString();
    },
    [decimalPlaces]
  );

  // Helper: Check if value is out of range
  const isOutOfRange = useCallback(
    (num: number | null): boolean => {
      if (num === null || num === undefined) return false;
      if (min !== undefined && num < min) return true;
      if (max !== undefined && num > max) return true;
      return false;
    },
    [min, max]
  );

  // Helper: Clamp value to min/max range
  const clampValue = useCallback(
    (num: number | null): number | null => {
      if (num === null || num === undefined) return num;
      let result = num;
      if (min !== undefined && result < min) result = min;
      if (max !== undefined && result > max) result = max;
      return result;
    },
    [min, max]
  );

  // Helper: Check if should show tooltip
  const shouldShowTooltip = useCallback(
    (num: number | null): boolean => {
      if (num === null || num === undefined) return false;
      const hasDecimalPart = num % 1 !== 0;
      const hasThousandSeparator = Math.abs(num) >= 1000;
      return hasDecimalPart || hasThousandSeparator || isOutOfRange(num);
    },
    [isOutOfRange]
  );

  // Helper: Build tooltip content as ReactNode for multiline support
  const buildTooltipContent = useCallback(
    (num: number | null): React.ReactNode => {
      if (!isFocused || num === null || num === undefined) return null;
      if (!shouldShowTooltip(num)) return null;

      const valueDisplay = getDisplayValue(num);

      if (isOutOfRange(num)) {
        const rangeParts: string[] = [];
        if (min !== undefined) rangeParts.push(`Min: ${getDisplayValue(min)}`);
        if (max !== undefined) rangeParts.push(`Max: ${getDisplayValue(max)}`);

        if (rangeParts.length > 0) {
          return (
            <div className="flex flex-col gap-0.5">
              <div>{valueDisplay}</div>
              <div className="text-xs opacity-80">{rangeParts.join(" - ")}</div>
            </div>
          );
        }
      }

      return valueDisplay;
    },
    [isFocused, shouldShowTooltip, isOutOfRange, getDisplayValue, min, max]
  );

  const handleChange = useCallback(
    (valueChanged: string) => {
      if (isFocused) {
        setInputValue(valueChanged);
      }

      const parsedValue = parseToNumber(valueChanged);

      if (!isControlled) {
        setInternalValue(parsedValue);
      }

      onValueChange?.(parsedValue);
    },
    [isFocused, parseToNumber, isControlled, onValueChange]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setInputValue(getRawValue(currentValue));

      setTimeout(() => {
        e.target.select();
      }, 0);

      rest.onFocus?.(e);
    },
    [currentValue, getRawValue, rest]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const parsedValue = parseToNumber(e.target.value);

      // Clamp value to min/max range when blur
      const clampedValue = clampValue(parsedValue);

      // Update value if it was clamped
      if (clampedValue !== parsedValue) {
        if (!isControlled) {
          setInternalValue(clampedValue);
        }
        onValueChange?.(clampedValue);
      }

      const formattedValue = getDisplayValue(clampedValue);

      if (e.target.value !== formattedValue) {
        e.target.value = formattedValue;
      }

      rest.onBlur?.(e);
    },
    [
      parseToNumber,
      clampValue,
      getDisplayValue,
      isControlled,
      onValueChange,
      rest,
    ]
  );

  const displayValue = useMemo(
    () => (isFocused ? inputValue : getDisplayValue(currentValue)),
    [isFocused, inputValue, currentValue, getDisplayValue]
  );

  const hasValue = useMemo(
    () =>
      displayValue !== "" &&
      displayValue !== null &&
      displayValue !== undefined,
    [displayValue]
  );

  const isInvalid = useMemo(
    () => isOutOfRange(currentValue),
    [isOutOfRange, currentValue]
  );

  const tooltipContent = useMemo(
    () => buildTooltipContent(currentValue),
    [buildTooltipContent, currentValue]
  );

  const shouldShowTooltipElement = isFocused && tooltipContent !== null;

  return (
    <IBaseTooltip
      content={tooltipContent}
      isOpen={shouldShowTooltipElement}
      placement="top"
    >
      <IBaseInput
        ref={ref}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onValueChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        classNames={{
          ...rest.classNames,
          input: clsx(
            rest.classNames?.input,
            hasValue ? "text-right" : "text-left",
            isInvalid && "text-danger"
          ),
        }}
        {...rest}
      />
    </IBaseTooltip>
  );
});

IBaseInputNumber.displayName = "IBaseInputNumber";

export default IBaseInputNumber;
