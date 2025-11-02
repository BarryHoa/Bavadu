"use client";
import type { ThemeProviderProps } from "next-themes";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";

import { SettingsProvider } from "./context/SettingsContext";

import { NavigationLoader } from "@/module-base/client/components/NavigationLoader";
import { GlobalSettingsProvider } from "@base/client/contexts/global-settings";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <GlobalSettingsProvider>
          <SettingsProvider>
            <NavigationLoader minLoadingTime={300} style="bar" />
            {children}
          </SettingsProvider>
        </GlobalSettingsProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
