"use client";

import { ThemeProvider, Preflight } from "@xstyled/emotion";
import { useThemeStore } from "./stores/themeStore";

interface XStyledThemeProviderProps {
  children: React.ReactNode;
}

export function XStyledThemeProvider({ children }: XStyledThemeProviderProps) {
  const { getCurrentTheme } = useThemeStore();
  const theme = getCurrentTheme();

  return (
    <ThemeProvider theme={theme}>
      <Preflight />
      {children}
    </ThemeProvider>
  );
}
