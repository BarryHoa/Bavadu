"use client";

import { ThemeProvider, Preflight } from "@xstyled/emotion";
import { useThemeStore } from "./stores/themeStore";

interface XStyledThemeProviderProps {
  children: React.ReactNode;
}

export function XStyledThemeProvider({ children }: XStyledThemeProviderProps) {
  const { getCurrentTheme } = useThemeStore();
  const theme = getCurrentTheme();

  // Convert our theme to XStyled format
  const xstyledTheme = {
    colors: {
      primary: theme.colors.primary,
      secondary: theme.colors.secondary,
      success: theme.colors.success,
      error: theme.colors.error,
      warning: theme.colors.warning,
      background: theme.colors.background,
      foreground: theme.colors.foreground,
      muted: theme.colors.muted,
      mutedForeground: theme.colors.mutedForeground,
      border: theme.colors.border,
      input: theme.colors.input,
      ring: theme.colors.ring,
    },
    space: {
      xs: theme.spacing.xs,
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
      xl: theme.spacing.xl,
      "2xl": theme.spacing["2xl"],
    },
    sizes: {
      xs: theme.spacing.xs,
      sm: theme.spacing.sm,
      md: theme.spacing.md,
      lg: theme.spacing.lg,
      xl: theme.spacing.xl,
      "2xl": theme.spacing["2xl"],
    },
    radii: {
      sm: theme.borderRadius.sm,
      md: theme.borderRadius.md,
      lg: theme.borderRadius.lg,
      xl: theme.borderRadius.xl,
    },
    fontSizes: {
      xs: theme.fontSize.xs,
      sm: theme.fontSize.sm,
      base: theme.fontSize.base,
      lg: theme.fontSize.lg,
      xl: theme.fontSize.xl,
      "2xl": theme.fontSize["2xl"],
      "3xl": theme.fontSize["3xl"],
    },
    fontWeights: {
      normal: theme.fontWeight.normal,
      medium: theme.fontWeight.medium,
      semibold: theme.fontWeight.semibold,
      bold: theme.fontWeight.bold,
    },
    shadows: {
      sm: theme.boxShadow.sm,
      md: theme.boxShadow.md,
      lg: theme.boxShadow.lg,
    },
    breakpoints: {
      xs: "0px",
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1400px",
    },
  };

  return (
    <ThemeProvider theme={xstyledTheme}>
      <Preflight />
      {children}
    </ThemeProvider>
  );
}
