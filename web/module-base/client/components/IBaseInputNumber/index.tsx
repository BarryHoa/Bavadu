import { InputProps } from "@heroui/input";
import clsx from "clsx";
import React, { useMemo, useState } from "react";
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
  const getDisplayValue = (num: number | null): string => {
    if (num === null || num === undefined) return "";
    return formatNumber(num, {
      decimalPlaces,
      thousandSeparator,
      decimalSeparator,
      fixZero,
    });
  };

  // Helper: Clean input string for parsing
  const cleanInputString = (str: string): string => {
    if (!str?.trim()) return "";

    let cleaned = str
      .replace(new RegExp(`\\${thousandSeparator}`, "g"), "")
      .replace(/[^\d.-]/g, "");

    if (decimalSeparator !== ".") {
      cleaned = cleaned.replace(new RegExp(`\\${decimalSeparator}`, "g"), ".");
    }

    if (!allowNegative) {
      cleaned = cleaned.replace(/-/g, "");
    }

    return cleaned;
  };

  // Helper: Parse string to number (without enforcing min/max)
  const parseToNumber = (str: string): number | null => {
    const cleaned = cleanInputString(str);
    if (!cleaned) return null;

    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return null;

    if (decimalPlaces >= 0) {
      return Number(parsed.toFixed(decimalPlaces));
    }

    return parsed;
  };

  // Helper: Get raw value without formatting (for focused state)
  const getRawValue = (num: number | null): string => {
    if (num === null || num === undefined) return "";

    if (decimalPlaces > 0) {
      const formatted = num.toFixed(decimalPlaces);
      if (formatted.includes(".")) {
        return formatted.replace(/\.?0+$/, "");
      }
      return formatted;
    }

    return num.toString();
  };

  // Helper: Check if value is out of range
  const isOutOfRange = (num: number | null): boolean => {
    if (num === null || num === undefined) return false;
    if (min !== undefined && num < min) return true;
    if (max !== undefined && num > max) return true;
    return false;
  };

  // Helper: Clamp value to min/max range
  const clampValue = (num: number | null): number | null => {
    if (num === null || num === undefined) return num;
    let result = num;
    if (min !== undefined && result < min) result = min;
    if (max !== undefined && result > max) result = max;
    return result;
  };

  // Helper: Check if should show tooltip
  const shouldShowTooltip = (num: number | null): boolean => {
    if (num === null || num === undefined) return false;
    const hasDecimalPart = num % 1 !== 0;
    const hasThousandSeparator = Math.abs(num) >= 1000;
    return hasDecimalPart || hasThousandSeparator || isOutOfRange(num);
  };

  // Helper: Build tooltip content as ReactNode for multiline support
  // Note: This function is called inside useMemo, so it doesn't need to be memoized
  const buildTooltipContent = (num: number | null): React.ReactNode => {
    if (!isFocused || num === null || num === undefined) return null;

    const hasDecimalPart = num % 1 !== 0;
    const hasThousandSeparator = Math.abs(num) >= 1000;
    const outOfRange = isOutOfRange(num);

    if (!hasDecimalPart && !hasThousandSeparator && !outOfRange) return null;

    const valueDisplay = getDisplayValue(num);

    if (outOfRange) {
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
  };

  const handleChange = (valueChanged: string) => {
    if (isFocused) {
      setInputValue(valueChanged);
      // Don't call onValueChange while focused to avoid re-rendering parent
      // Only update internal state for display purposes
      if (!isControlled) {
        const parsedValue = parseToNumber(valueChanged);
        setInternalValue(parsedValue);
      }
      return;
    }

    // When not focused, update normally
    const parsedValue = parseToNumber(valueChanged);

    if (!isControlled) {
      setInternalValue(parsedValue);
    }

    onValueChange?.(parsedValue);
  };

  // Memoize displayValue to avoid unnecessary recalculations
  const displayValue = useMemo(() => {
    if (isFocused) {
      return inputValue;
    }
    if (currentValue === null || currentValue === undefined) {
      return "";
    }
    return formatNumber(currentValue, {
      decimalPlaces,
      thousandSeparator,
      decimalSeparator,
      fixZero,
    });
  }, [
    isFocused,
    inputValue,
    currentValue,
    decimalPlaces,
    thousandSeparator,
    decimalSeparator,
    fixZero,
  ]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const rawValue = getRawValue(currentValue);

    // Batch state updates to avoid multiple re-renders
    setIsFocused(true);
    setInputValue(rawValue);

    // Use requestAnimationFrame instead of setTimeout for smoother selection
    requestAnimationFrame(() => {
      e.target.select();
    });

    rest.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const parsedValue = parseToNumber(e.target.value);

    // Clamp value to min/max range when blur
    const clampedValue = clampValue(parsedValue);

    // Update internal state if uncontrolled
    if (!isControlled) {
      setInternalValue(clampedValue);
    }

    // Always call onValueChange on blur to sync with parent
    // Check if value actually changed to avoid unnecessary updates
    if (clampedValue !== currentValue) {
      onValueChange?.(clampedValue);
    }

    const formattedValue = getDisplayValue(clampedValue);

    if (e.target.value !== formattedValue) {
      e.target.value = formattedValue;
    }

    rest.onBlur?.(e);
  };

  const hasValue =
    displayValue !== "" && displayValue !== null && displayValue !== undefined;
  const isInvalid = isOutOfRange(currentValue);

  // Memoize tooltip content to avoid re-creating ReactNode on every render
  // Only recalculate when relevant values change
  const tooltipContent = useMemo(() => {
    if (!isFocused || currentValue === null || currentValue === undefined)
      return null;

    const hasDecimalPart = currentValue % 1 !== 0;
    const hasThousandSeparator = Math.abs(currentValue) >= 1000;
    const outOfRange =
      (min !== undefined && currentValue < min) ||
      (max !== undefined && currentValue > max);

    if (!hasDecimalPart && !hasThousandSeparator && !outOfRange) return null;

    const valueDisplay = formatNumber(currentValue, {
      decimalPlaces,
      thousandSeparator,
      decimalSeparator,
      fixZero,
    });

    if (outOfRange) {
      const rangeParts: string[] = [];
      if (min !== undefined) {
        rangeParts.push(
          `Min: ${formatNumber(min, {
            decimalPlaces,
            thousandSeparator,
            decimalSeparator,
            fixZero,
          })}`
        );
      }
      if (max !== undefined) {
        rangeParts.push(
          `Max: ${formatNumber(max, {
            decimalPlaces,
            thousandSeparator,
            decimalSeparator,
            fixZero,
          })}`
        );
      }

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
  }, [
    isFocused,
    currentValue,
    min,
    max,
    decimalPlaces,
    thousandSeparator,
    decimalSeparator,
    fixZero,
  ]);

  const shouldShowTooltipElement = isFocused && tooltipContent !== null;

  // Memoize classNames to avoid re-creating object on every render
  const inputClassNames = useMemo(
    () => ({
      ...rest.classNames,
      input: clsx(
        rest.classNames?.input,
        hasValue ? "text-right" : "text-left",
        isInvalid && "text-danger"
      ),
    }),
    [rest.classNames, hasValue, isInvalid]
  );

  return (
    <IBaseTooltip
      content={tooltipContent}
      isOpen={shouldShowTooltipElement}
      placement="top"
      showArrow
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
        classNames={inputClassNames}
        {...rest}
      />
    </IBaseTooltip>
  );
});

IBaseInputNumber.displayName = "IBaseInputNumber";

export default IBaseInputNumber;
