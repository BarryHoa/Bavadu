"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { LoadingBar } from "./LoadingBar";

interface NavigationLoaderContentProps {
  minLoadingTime?: number;
}

function NavigationLoaderContent({
  minLoadingTime = 300,
}: NavigationLoaderContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isFirstRenderRef = useRef(true);

  // Helper function để clear timer
  const clearLoadingTimer = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
  }, []);

  // Helper function để stop loading
  const stopLoading = useCallback(() => {
    clearLoadingTimer();
    setIsLoading(false);
  }, [clearLoadingTimer]);

  // Global click listener để bắt link clicks NGAY LẬP TỨC
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");
      const targetAttr = link.getAttribute("target");

      // Chỉ xử lý internal links
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("//") &&
        targetAttr !== "_blank" &&
        !link.hasAttribute("download")
      ) {
        clearLoadingTimer();
        setIsLoading(true);
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener("click", handleClick, true);

    return () => document.removeEventListener("click", handleClick, true);
  }, [clearLoadingTimer]);

  // Theo dõi pathname/searchParams để biết khi nào page mới đã load xong
  useEffect(() => {
    // Skip first render
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;

      return;
    }

    // Nếu không đang loading, không cần làm gì
    if (!isLoading) return;

    clearLoadingTimer();

    // Đợi DOM update xong (page mới đã được generate)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const remainingTime = Math.max(0, minLoadingTime - elapsed);

        loadingTimerRef.current = setTimeout(stopLoading, remainingTime);
      });
    });

    return clearLoadingTimer;
  }, [
    pathname,
    searchParams,
    minLoadingTime,
    isLoading,
    clearLoadingTimer,
    stopLoading,
  ]);

  // Cleanup on unmount
  useEffect(() => clearLoadingTimer, [clearLoadingTimer]);

  return <LoadingBar isLoading={isLoading} />;
}

export function NavigationLoader(props: NavigationLoaderContentProps) {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderContent {...props} />
    </Suspense>
  );
}
