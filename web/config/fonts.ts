import {
  Fira_Code as FontMono,
  Inter as FontSans,
  Noto_Sans_SC,
} from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
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
