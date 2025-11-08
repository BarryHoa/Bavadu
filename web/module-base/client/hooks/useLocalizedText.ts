import { LocaleDataType } from "@/module-base/server/interfaces/Locale";
import { useLocale } from "next-intl";

export const useLocalizedText = (locale?: string) => {
  // Detect environment: window is undefined on the server
  //   let lang = "en";
  const lang = useLocale();

  const detectedLang = locale || lang;

  return (text: LocaleDataType<string> | string | undefined | null) => {
    if (!text) return "";
    if (typeof text === "string") {
      return text;
    }

    if (text[detectedLang as keyof typeof text]) {
      return text[detectedLang as keyof typeof text];
    }
    return text.en || text.vi || null;
  };
};
