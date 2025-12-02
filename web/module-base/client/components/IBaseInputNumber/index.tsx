"use client";

import { InputProps } from "@heroui/input";
import clsx from "clsx";
import { useTranslations } from "next-intl";
import React, { useCallback, useMemo, useState } from "react";
import { formatNumber } from "../../utils/number";
import IBaseInput from "../IBaseInput";
import IBaseTooltip from "../IBaseTooltip";

type InputNumberValue = number | null | undefined;
export interface IBaseInputNumberProps
  extends Omit<InputProps, "onValueChange" | "value" | "defaultValue"> {
  value?: InputNumberValue;
  defaultValue?: InputNumberValue;
  onValueChange?: (value: InputNumberValue) => void;
  decimalPlaces?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;
  allowNegative?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
  fixZero?: boolean;
}

// Format number to display string
function formatDisplay(
  num: InputNumberValue,
  options: {
    decimalPlaces: number;
    thousandSeparator: string;
    decimalSeparator: string;
    fixZero: boolean;
  }
): string {
  if (num === null || num === undefined) return "";
  return formatNumber(num, {
    decimalPlaces: options.decimalPlaces,
    thousandSeparator: options.thousandSeparator,
    decimalSeparator: options.decimalSeparator,
    fixZero: options.fixZero,
  });
}

// Get raw value without formatting
function getRaw(num: InputNumberValue, decimalPlaces: number): string {
  if (num === null || num === undefined) return "";
  if (decimalPlaces > 0) {
    const formatted = num.toFixed(decimalPlaces);
    return formatted.includes(".")
      ? formatted.replace(/\.?0+$/, "")
      : formatted;
  }
  return num.toString();
}

// Parse string to number
function parseToNumber(
  str: string,
  options: {
    thousandSeparator: string;
    decimalSeparator: string;
    allowNegative: boolean;
    decimalPlaces: number;
  }
): InputNumberValue {
  if (!str?.trim()) return null;

  let cleaned = str
    .replace(new RegExp(`\\${options.thousandSeparator}`, "g"), "")
    .replace(/[^\d.-]/g, "");

  if (options.decimalSeparator !== ".") {
    cleaned = cleaned.replace(
      new RegExp(`\\${options.decimalSeparator}`, "g"),
      "."
    );
  }

  if (!options.allowNegative) {
    cleaned = cleaned.replace(/-/g, "");
  }

  if (!cleaned) return null;

  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return null;

  return options.decimalPlaces >= 0
    ? Number(parsed.toFixed(options.decimalPlaces))
    : parsed;
}

// Clamp value to min/max range
function clampValue(
  num: InputNumberValue,
  min?: number,
  max?: number
): InputNumberValue {
  if (num === null || num === undefined) return num;
  let result = num;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}

const IBaseInputNumber = React.forwardRef<
  HTMLInputElement,
  IBaseInputNumberProps
>((props, ref) => {
  const t = useTranslations("components.input");
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
    placeholder,
    fixZero = true,
    ...rest
  } = props;
  const defaultPlaceholder = t("numberPlaceholder");

  const isControlled = controlledValue !== undefined;

  const [inputState, setInputState] = useState<{
    display: string | undefined;
    raw: InputNumberValue;
    rawInput: string; // Store raw string input when focused
    isFocused: boolean;
  }>(() => {
    return {
      display: formatDisplay(defaultValue, {
        decimalPlaces,
        thousandSeparator,
        decimalSeparator,
        fixZero,
      }),
      raw: defaultValue,
      rawInput:
        defaultValue !== null && defaultValue !== undefined
          ? getRaw(defaultValue, decimalPlaces)
          : "",
      isFocused: false,
    };
  });

  // Get current numeric value
  const currentValue = useMemo(
    () => (isControlled ? controlledValue : inputState.raw),
    [controlledValue, inputState.raw]
  );

  const handleChange = useCallback(
    (valueChanged: string) => {
      // When focused, store raw input string to allow decimal input
      if (inputState.isFocused) {
        setInputState((prev) => ({
          ...prev,
          rawInput: valueChanged,
        }));

        // Parse and update value, but don't restrict decimal input
        // Allow partial input like "0." or "0.1"
        const cleaned = valueChanged
          .replace(new RegExp(`\\${thousandSeparator}`, "g"), "")
          .replace(/[^\d.-]/g, "");

        let normalized = cleaned;
        if (decimalSeparator !== ".") {
          normalized = cleaned.replace(
            new RegExp(`\\${decimalSeparator}`, "g"),
            "."
          );
        }

        if (!allowNegative) {
          normalized = normalized.replace(/-/g, "");
        }

        // Allow partial decimal input (e.g., "0.", "0.1")
        if (
          normalized === "" ||
          normalized === "." ||
          normalized === "-" ||
          normalized === "-."
        ) {
          setInputState((prev) => ({
            ...prev,
            raw: null,
          }));
          onValueChange?.(null);
          return;
        }

        // Try to parse, but allow NaN for partial input
        const parsed = parseFloat(normalized);
        if (!isNaN(parsed)) {
          // Don't apply decimalPlaces restriction while typing
          const parsedValue =
            decimalPlaces >= 0
              ? Number(parsed.toFixed(Math.max(decimalPlaces, 10))) // Use higher precision while typing
              : parsed;

          setInputState((prev) => ({
            ...prev,
            raw: parsedValue,
          }));
          onValueChange?.(parsedValue);
        } else {
          // Invalid input, but keep rawInput for user to continue typing
          setInputState((prev) => ({
            ...prev,
            raw: null,
          }));
          onValueChange?.(null);
        }
      } else {
        // Not focused, parse normally
        const parsedValue = parseToNumber(valueChanged, {
          thousandSeparator,
          decimalSeparator,
          allowNegative,
          decimalPlaces,
        });

        setInputState((prev) => ({
          ...prev,
          raw: parsedValue,
        }));

        onValueChange?.(parsedValue);
      }
    },
    [
      thousandSeparator,
      decimalSeparator,
      allowNegative,
      decimalPlaces,
      onValueChange,
      inputState.isFocused,
    ]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      const currentRaw =
        inputState.raw !== null && inputState.raw !== undefined
          ? getRaw(inputState.raw, decimalPlaces)
          : "";

      setInputState((prev) => ({
        ...prev,
        isFocused: true,
        rawInput: currentRaw,
      }));

      setTimeout(() => {
        e.target.select();
      }, 0);

      rest.onFocus?.(e);
      e.preventDefault();
      e.stopPropagation();
    },
    [rest.onFocus, inputState.raw, decimalPlaces]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      e.preventDefault();

      // Parse the raw input string with proper decimal places restriction
      const finalValue = parseToNumber(inputState.rawInput, {
        thousandSeparator,
        decimalSeparator,
        allowNegative,
        decimalPlaces,
      });

      const clampedValue = clampValue(finalValue, min, max);

      if (clampedValue !== finalValue || clampedValue !== inputState.raw) {
        onValueChange?.(clampedValue);
      }

      const display = formatDisplay(clampedValue, {
        decimalPlaces,
        thousandSeparator,
        decimalSeparator,
        fixZero,
      });

      setInputState((prev) => ({
        ...prev,
        display,
        raw: clampedValue,
        rawInput:
          clampedValue !== null && clampedValue !== undefined
            ? getRaw(clampedValue, decimalPlaces)
            : "",
        isFocused: false,
      }));

      rest.onBlur?.(e);
      e.stopPropagation();
    },
    [
      rest.onBlur,
      onValueChange,
      min,
      max,
      inputState.rawInput,
      inputState.raw,
      thousandSeparator,
      decimalSeparator,
      allowNegative,
      decimalPlaces,
    ]
  );

  // Update display when value changes externally
  React.useEffect(() => {
    if (!inputState.isFocused) {
      const display = formatDisplay(currentValue, {
        decimalPlaces,
        thousandSeparator,
        decimalSeparator,
        fixZero,
      });
      setInputState((prev) => ({
        ...prev,
        display,
        raw: currentValue,
        rawInput:
          currentValue !== null && currentValue !== undefined
            ? getRaw(currentValue, decimalPlaces)
            : "",
      }));
    }
  }, [controlledValue]);

  const hasValue = currentValue !== null && currentValue !== undefined;

  const isInvalid =
    currentValue !== null &&
    currentValue !== undefined &&
    ((min !== undefined && currentValue < min) ||
      (max !== undefined && currentValue > max));

  const tooltipContent = useMemo(() => {
    if (
      !inputState.isFocused ||
      currentValue === null ||
      currentValue === undefined
    )
      return null;

    const hasDecimalPart = currentValue % 1 !== 0;
    const hasThousandSeparator = Math.abs(currentValue) >= 1000;
    const outOfRange = isInvalid;

    if (!hasDecimalPart && !hasThousandSeparator && !outOfRange) return null;

    const formatOptions = {
      decimalPlaces,
      thousandSeparator,
      decimalSeparator,
      fixZero,
    };
    const valueDisplay = formatDisplay(currentValue, formatOptions);

    if (outOfRange) {
      const rangeParts: string[] = [];
      if (min !== undefined)
        rangeParts.push(`Min: ${formatDisplay(min, formatOptions)}`);
      if (max !== undefined)
        rangeParts.push(`Max: ${formatDisplay(max, formatOptions)}`);

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
    inputState.isFocused,
    currentValue,
    isInvalid,
    decimalPlaces,
    thousandSeparator,
    decimalSeparator,
    fixZero,
    min,
    max,
  ]);

  return (
    <IBaseTooltip
      content={tooltipContent}
      isOpen={inputState.isFocused && tooltipContent !== null}
      placement="top"
    >
      <IBaseInput
        ref={ref}
        type="text"
        inputMode="decimal"
        value={
          inputState.isFocused
            ? inputState.rawInput
            : (inputState.display ?? "")
        }
        onValueChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder ?? defaultPlaceholder}
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
