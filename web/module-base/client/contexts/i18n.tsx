"use client";

import { NextIntlClientProvider } from "next-intl";
const timeZone = "Asia/Ho_Chi_Minh";
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
      timeZone={timeZone}
    >
      {children}
    </NextIntlClientProvider>
  );
}
