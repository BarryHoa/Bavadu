/**
 * Formats a number with custom decimal places, thousand separator, and decimal separator
 * @param num - The number to format (null, undefined, or NaN will be treated as 0)
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber(
  num: number | null | undefined,
  options: {
    decimalPlaces?: number;
    thousandSeparator?: string;
    decimalSeparator?: string;
    fixZero?: boolean;
  } = {}
): string {
  const {
    decimalPlaces = 2,
    thousandSeparator = ",",
    decimalSeparator = ".",
    fixZero = false,
  } = options;

  // Handle null, undefined, or NaN -> treat as 0
  if (num === null || num === undefined || isNaN(Number(num))) {
    num = 0;
  }

  // Format with decimal places
  const formatted = num.toFixed(decimalPlaces);

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = formatted.split(".");

  // Add thousand separators to integer part
  const integerWithSeparators = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    thousandSeparator
  );

  // Combine parts
  let result = integerWithSeparators;

  // If fixZero is true, always show decimal part
  // If fixZero is false, only show decimal part if it's not all zeros, and remove trailing zeros
  if (decimalPlaces > 0) {
    if (fixZero) {
      // Always show decimal part when fixZero is true
      result += decimalSeparator + decimalPart;
    } else {
      // Only show decimal part if it's not all zeros
      const hasNonZeroDecimal = decimalPart && /[1-9]/.test(decimalPart);
      if (hasNonZeroDecimal) {
        // Remove trailing zeros from decimal part
        const trimmedDecimal = decimalPart.replace(/0+$/, "");
        result += decimalSeparator + trimmedDecimal;
      }
    }
  }

  return result;
}
