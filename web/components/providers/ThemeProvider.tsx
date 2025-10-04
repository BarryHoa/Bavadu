"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/lib/stores/themeStore";
import { ThemeMode } from "@/themes/types";

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = "light",
  storageKey = "theme-storage",
}: ThemeProviderProps) {
  const { setTheme, getCurrentTheme } = useThemeStore();

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
      if (theme === "light") {
        setTheme("light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setTheme]);

  return <>{children}</>;
}
