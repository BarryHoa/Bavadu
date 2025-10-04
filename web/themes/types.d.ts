// Base theme interface
import styled, { DefaultTheme as DefaultThemeEmotion } from "@xstyled/emotion";

type Numbers1to10 = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
type Colors<T extends string> = {
  [K in `${T}${Numbers1to10}`]: string;
};
export interface CustomTheme extends Omit<DefaultThemeEmotion, "colors"> {
  // gen theme based on xstyled theme
  colors: {
    primary: string;
    secondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;

    textPrimary: string;
    textSecondary: string;
    disabled: string;
    border: string;
    background: string;
    foreground: string;
    mutedForeground: string;

    blue: Colors<"blue">;
    red: Colors<"red">;
    green: Colors<"green">;
    orange: Colors<"orange">;
    gold: Colors<"gold">;
    cyan: Colors<"cyan">;
    purple: Colors<"purple">;
    gray: Colors<"gray">;
  };
}

declare module "@emotion/react" {
  export interface Theme extends CustomTheme {}
}
export type ThemeMode = "light";
