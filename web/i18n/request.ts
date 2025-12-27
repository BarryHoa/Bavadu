import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

import { SYSTEM_TIMEZONE } from "@base/server/config/system";
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

/**
 * Dynamically load messages from all modules
 */
const loadModuleMessages = async (
  locale: SupportedLocale
): Promise<Record<string, unknown>> => {
  const modulesDir = join(process.cwd(), "modules");

  if (!existsSync(modulesDir)) {
    return {};
  }

  const moduleDirs = readdirSync(modulesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const moduleMessages: Record<string, unknown> = {};

  for (const moduleDir of moduleDirs) {
    const messageFile = join(
      modulesDir,
      moduleDir,
      "client",
      "messages",
      `${locale}.json`
    );

    let fileToRead = messageFile;

    // Try fallback locale if current locale doesn't exist
    if (!existsSync(messageFile)) {
      const fallbackFile = join(
        modulesDir,
        moduleDir,
        "client",
        "messages",
        `${FALLBACK_LOCALE}.json`
      );

      if (existsSync(fallbackFile)) {
        fileToRead = fallbackFile;
      } else {
        continue;
      }
    }

    try {
      const fileContent = readFileSync(fileToRead, "utf-8");
      const messages = JSON.parse(fileContent) as Record<string, unknown>;

      Object.assign(moduleMessages, messages);
    } catch (error) {
      console.error(
        `Error loading messages from ${fileToRead}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  return moduleMessages;
};

const loadMessages = async (locale: SupportedLocale) => {
  // Load base module messages
  const fallbackModuleMessages =
    await moduleBaseMessageLoaders[FALLBACK_LOCALE]();
  const localeModuleMessages = await moduleBaseMessageLoaders[locale]();

  // Load all module messages
  const moduleMessages = await loadModuleMessages(locale);

  return {
    ...fallbackModuleMessages,
    ...localeModuleMessages,
    ...moduleMessages,
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
