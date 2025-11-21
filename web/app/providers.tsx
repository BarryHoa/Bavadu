"use client";

import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { NavigationLoader } from "@base/client/components/NavigationLoader";
import { GlobalSettingsProvider } from "@base/client/contexts/global-settings";

export interface ProvidersProps {
  children: React.ReactNode;
}

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NonNullable<
      Parameters<ReturnType<typeof useRouter>["push"]>[1]
    >;
  }
}

export function Providers({ children }: ProvidersProps) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
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
        <ToastProvider
          placement="top-right"
          toastProps={{ variant: "solid" }}
        />
        <GlobalSettingsProvider>
            <NavigationLoader minLoadingTime={300} style="bar" />
            {children}
        </GlobalSettingsProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
