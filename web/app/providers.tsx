"use client";

import type { ThemeProviderProps } from "next-themes";

import { HeroUIProvider } from "@heroui/system";
import { NextIntlClientProvider } from "next-intl";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import * as React from "react";
import { NavigationLoader } from "@base/components/base/NavigationLoader";
import { GlobalSettingsProvider } from "@base/contexts/global-settings";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
  locale?: string;
  messages?: any;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({
  children,
  themeProps,
  locale = "en",
  messages,
}: ProvidersProps) {
  const router = useRouter();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <HeroUIProvider navigate={router.push}>
        <NextThemesProvider {...themeProps}>
          <GlobalSettingsProvider>
            <NavigationLoader style="bar" minLoadingTime={300} />
            {children}
          </GlobalSettingsProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </NextIntlClientProvider>
  );
}
