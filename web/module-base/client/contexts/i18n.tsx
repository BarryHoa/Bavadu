"use client";

import { useMessagesStore } from "@base/client/stores/messages-store";
import { SYSTEM_TIMEZONE } from "@base/shared/constants";
import { NextIntlClientProvider } from "next-intl";
import { useEffect, useMemo } from "react";

export default function ModuleI18nProvider({
  locale,
  initialMessages,
  children,
}: {
  locale: string;
  initialMessages: {
    common: Record<string, any>;
    [moduleName: string]: Record<string, any>;
  };
  children: React.ReactNode;
}) {
  const { setCommonMessages, setModuleMessages, messages } = useMessagesStore();

  // Initialize store with server-fetched messages
  useEffect(() => {
    const { common, ...moduleMessages } = initialMessages;

    setCommonMessages(common);

    // Set each module's messages
    Object.entries(moduleMessages).forEach(([moduleName, msg]) => {
      setModuleMessages(moduleName, msg);
    });
  }, [initialMessages, setCommonMessages, setModuleMessages]);

  // Get combined messages from store (subscribe to changes)
  const combinedMessages = useMemo(() => {
    const init = Object.values(initialMessages).reduce(
      (acc, msg) => ({ ...acc, ...msg }),
      {},
    );

    // Combine all messages: common first, then modules (later modules override earlier ones)
    return Object.values(messages).reduce(
      (acc, moduleMsg) => ({ ...acc, ...moduleMsg }),
      init,
    );
  }, [messages, initialMessages]);

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={combinedMessages}
      timeZone={SYSTEM_TIMEZONE}
    >
      {children}
    </NextIntlClientProvider>
  );
}
