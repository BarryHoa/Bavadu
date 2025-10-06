import { heroui } from "@heroui/theme";

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Satoshi", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)"],
        "noto-sans-sc": [
          "var(--font-noto-sans-sc)",
          "Noto Sans SC",
          "system-ui",
          "sans-serif",
        ],
        satoshi: ["Satoshi", "system-ui", "sans-serif"],
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()],
};

module.exports = config;
