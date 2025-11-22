import { SYSTEM_TIMEZONE } from "@base/shared/constants";
import { getRequestConfig, GetRequestConfigParams } from "next-intl/server";
import { notFound } from "next/navigation";

// Can be imported from a shared config
const locales = ["en", "vi"] as const;

const FALLBACK_LOCALE = "en" satisfies (typeof locales)[number];

type SupportedLocale = (typeof locales)[number];

type Loader = () => Promise<Record<string, unknown>>;

const moduleBaseMessageLoaders: Record<SupportedLocale, Loader> = {
  en: async () => {
    try {
      return (await import("@base/client/messages/en.json")).default ?? {};
    } catch {
      return {};
    }
  },
  vi: async () => {
    try {
      return (await import("@base/client/messages/vi.json")).default ?? {};
    } catch {
      return {};
    }
  },
};

const loadMessages = async (locale: SupportedLocale) => {
  const fallbackModuleMessages =
    await moduleBaseMessageLoaders[FALLBACK_LOCALE]();

  const localeModuleMessages = await moduleBaseMessageLoaders[locale]();

  return {
    ...fallbackModuleMessages,
    ...localeModuleMessages,
  };
};

export default getRequestConfig(async ({ locale }: GetRequestConfigParams) => {
  if (!locale || !locales.includes(locale as SupportedLocale)) notFound();

  const resolvedLocale = locale as SupportedLocale;
  const messages = await loadMessages(resolvedLocale);

  return {
    locale: resolvedLocale,
    messages,
    timeZone: SYSTEM_TIMEZONE,
  };
});
