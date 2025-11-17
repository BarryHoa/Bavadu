import { useLocale } from "next-intl";
import { DEFAULT_LANG, LocalizeText } from "../interface/LocalizeText";

const getLocalizedValue = (
  text: LocalizeText | string | undefined | null,
  locale: string
) => {
  if (!text) return "";
  if (typeof text === "string") return text;

  if (text[locale as keyof typeof text]) {
    return text[locale as keyof typeof text] ?? "";
  }

  return text.en || text.vi || "";
};

export const useLocalizedText = (locale?: string) => {
  let detectedLocale = locale ?? DEFAULT_LANG;

  try {
    const contextLocale = useLocale();
    detectedLocale = locale ?? contextLocale ?? DEFAULT_LANG;
  } catch (error) {
    detectedLocale = locale ?? DEFAULT_LANG;
  }

  return (text: LocalizeText | string | undefined | null) =>
    getLocalizedValue(text, detectedLocale);
};
