"use client";

import { useThemeStore } from "@/lib/stores/themeStore";
import { Button } from "../Button/Button";

const ThemeIcon = ({ theme }: { theme: "light" | "dark" | "blue" }) => {
  if (theme === "light") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    );
  }

  if (theme === "blue") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
        <path d="M12 8v8" />
      </svg>
    );
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
};

export function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useThemeStore();

  const cycleTheme = () => {
    const themes: Array<"light" | "dark" | "blue"> = ["light", "dark", "blue"];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeLabel = (theme: "light" | "dark" | "blue") => {
    switch (theme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      case "blue":
        return "Blue";
      default:
        return "Light";
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={cycleTheme}
        leftIcon={<ThemeIcon theme={theme} />}
      >
        {getThemeLabel(theme)}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={toggleTheme}
        leftIcon={
          <ThemeIcon
            theme={
              theme === "light" ? "dark" : theme === "dark" ? "blue" : "light"
            }
          />
        }
      >
        Toggle
      </Button>
    </div>
  );
}
