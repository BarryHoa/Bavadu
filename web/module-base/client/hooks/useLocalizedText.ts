import { LocaleDataType } from "@/module-base/server/interfaces/Locale";
import { useLocale } from "next-intl";

const DEFAULT_LOCALE = "en";

const getLocalizedValue = (
  text: LocaleDataType<string> | string | undefined | null,
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
  let detectedLocale = locale ?? DEFAULT_LOCALE;

  try {
    const contextLocale = useLocale();
    detectedLocale = locale ?? contextLocale ?? DEFAULT_LOCALE;
  } catch (error) {
    detectedLocale = locale ?? DEFAULT_LOCALE;
  }

  return (text: LocaleDataType<string> | string | undefined | null) =>
    getLocalizedValue(text, detectedLocale);
};

export const localizeText = (
  text: LocaleDataType<string> | string | undefined | null,
  locale: string = DEFAULT_LOCALE
) => getLocalizedValue(text, locale);
