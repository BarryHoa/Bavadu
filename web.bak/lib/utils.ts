import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Theme utilities
export function getThemeFromStorage(): "light" | "dark" | "system" {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem("theme-storage");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.theme || "system";
    }
  } catch {
    // Ignore parsing errors
  }

  return "system";
}

export function applyTheme(theme: "light" | "dark" | "system") {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  if (resolvedTheme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

// Format utilities
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency = "VND"): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency,
  }).format(amount);
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

// String utilities
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

// Array utilities
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function groupBy<T, K extends string | number>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = key(item);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}
