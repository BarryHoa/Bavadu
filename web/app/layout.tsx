import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { EmotionProvider } from "@/lib/emotion-provider";
import { XStyledThemeProvider } from "@/lib/xstyled-theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bava Frontend",
  description:
    "High-performance React frontend with Next.js 15, Ark UI, and Panda CSS",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <EmotionProvider>
          <XStyledThemeProvider>{children}</XStyledThemeProvider>
        </EmotionProvider>
      </body>
    </html>
  );
}
