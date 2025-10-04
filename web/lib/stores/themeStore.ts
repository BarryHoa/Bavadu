import { create } from "zustand";
import { persist } from "zustand/middleware";
import { lightTheme, Theme, ThemeMode } from "../../themes";

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ThemeMode;
}

interface ThemeActions {
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  getCurrentTheme: () => Theme;
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      // State
      theme: "light" as ThemeMode,
      resolvedTheme: "light" as ThemeMode,

      // Actions
      setTheme: (theme: ThemeMode) => {
        set({ theme, resolvedTheme: theme });

        // Apply theme to document
        // if (typeof window !== "undefined") {
        //   const root = document.documentElement;

        //   if (theme === "dark") {
        //     root.classList.add("dark");
        //   } else {
        //     root.classList.remove("dark");
        //   }
        // }
      },

      toggleTheme: () => {
        const { theme } = get();
        const themes: ThemeMode[] = ["light"];
        const currentIndex = themes.indexOf(theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        const newTheme = themes[nextIndex];
        get().setTheme(newTheme);
      },

      getCurrentTheme: () => {
        const { resolvedTheme } = get();
        const themes = {
          // dark : darkTheme,
          light: lightTheme,
        };
        return themes[resolvedTheme] || lightTheme;
      },
    }),
    {
      name: "theme-storage",
      skipHydration: true,
      partialize: (state) => ({
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Apply theme on hydration
          state.resolvedTheme = state.theme;

          // if (typeof window !== "undefined") {
          //   const root = document.documentElement;

          //   if (state.theme === "dark") {
          //     root.classList.add("dark");
          //   } else {
          //     root.classList.remove("dark");
          //   }
          // }
        }
      },
    }
  )
);

// Theme store is ready
