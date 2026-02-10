import {
  Fira_Code as FontMono,
  Noto_Sans_SC,
  Roboto as FontSans,
} from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin", "latin-ext"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const fontNotoSansSC = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-noto-sans-sc",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});
