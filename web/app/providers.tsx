"use client";
import type { ThemeProviderProps } from "next-themes";

import { HeroUIProvider } from "@heroui/system";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0, // Thời gian (ms) React Query coi dữ liệu là "stale" (lỗi) nếu nó không được refresh từ server.
            gcTime: 0, // xóa cache sau unmount Là thời gian (ms) React Query giữ cache trong bộ nhớ sau khi không còn component nào đang dùng.
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}
