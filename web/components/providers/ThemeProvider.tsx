"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/stores/themeStore";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark" | "system";
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme-storage",
}: ThemeProviderProps) {
  const { setTheme, getSystemTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on mount
    const storedTheme = localStorage.getItem(storageKey);

    if (storedTheme) {
      const parsed = JSON.parse(storedTheme);
      setTheme(parsed.state.theme || defaultTheme);
    } else {
      setTheme(defaultTheme);
    }
  }, [setTheme, defaultTheme, storageKey]);

  useEffect(() => {
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => {
      const { theme } = useThemeStore.getState();
      if (theme === "system") {
        setTheme("system");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setTheme]);

  return <>{children}</>;
}
