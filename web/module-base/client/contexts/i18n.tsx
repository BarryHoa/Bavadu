"use client";

import { SYSTEM_TIMEZONE } from "@base/shared/constants";
import { NextIntlClientProvider } from "next-intl";
export default function ModuleI18nProvider({
  locale,
  messages,
  children,
}: {
  locale: string;
  messages: Record<string, any>;
  children: React.ReactNode;
}) {
  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      timeZone={SYSTEM_TIMEZONE}
    >
      {children}
    </NextIntlClientProvider>
  );
}
