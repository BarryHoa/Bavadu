import { CustomTheme, ThemeMode } from "./types";

// Export theme types
export type { CustomTheme as Theme, ThemeMode } from "./types";

// Export theme implementations
export { lightTheme } from "./light";
// export { darkTheme } from "./dark";
// export { blueTheme } from "./blue";

// Theme registry
export const themes = {
  light: () => import("./light").then((m) => m.lightTheme),
  // dark: () => import("./dark").then((m) => m.darkTheme),
  // blue: () => import("./blue").then((m) => m.blueTheme),
} as const;

// Get theme by name
export const getTheme = async (themeName: ThemeMode): Promise<CustomTheme> => {
  const themeLoader = themes[themeName];
  if (!themeLoader) {
    throw new Error(`Theme "${themeName}" not found`);
  }
  return await themeLoader();
};

// Get all available theme names
export const getAvailableThemes = (): ThemeMode[] => {
  return Object.keys(themes) as ThemeMode[];
};
