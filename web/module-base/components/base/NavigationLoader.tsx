"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef, Suspense } from "react";
import { LoadingBar } from "./LoadingBar";
import { LoadingOverlay } from "./LoadingOverlay";

type LoadingStyle = "bar" | "overlay" | "both";

interface NavigationLoaderContentProps {
  style?: LoadingStyle;
  minLoadingTime?: number;
}

function NavigationLoaderContent({
  style = "bar",
  minLoadingTime = 300,
}: NavigationLoaderContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isFirstRenderRef = useRef(true);

  // Global click listener để bắt link clicks NGAY LẬP TỨC
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Tìm link element (có thể là parent của element được click)
      const link = target.closest("a");

      if (link) {
        const href = link.getAttribute("href");
        const targetAttr = link.getAttribute("target");

        // Chỉ xử lý internal links (không có target="_blank" và href bắt đầu với /)
        if (
          href &&
          href.startsWith("/") &&
          !href.startsWith("//") &&
          targetAttr !== "_blank" &&
          !link.hasAttribute("download")
        ) {
          // Bắt đầu loading NGAY KHI user click
          setIsLoading(true);
          startTimeRef.current = Date.now();
        }
      }
    };

    // Sử dụng capture phase để bắt event sớm nhất có thể
    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  // Theo dõi pathname/searchParams để biết khi nào page mới đã load xong
  useEffect(() => {
    // Skip first render (tránh hiển thị loading khi page load lần đầu)
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // Clear any existing timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    // Nếu đang loading, đợi page render xong
    if (isLoading) {
      // Sử dụng requestAnimationFrame để đợi DOM update xong
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Tính thời gian đã trôi qua
          const elapsed = Date.now() - startTimeRef.current;
          const remainingTime = Math.max(0, minLoadingTime - elapsed);

          // Đợi thêm remaining time để đảm bảo minimum loading time
          loadingTimerRef.current = setTimeout(() => {
            setIsLoading(false);
          }, remainingTime);
        });
      });
    }

    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [pathname, searchParams, minLoadingTime, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      {(style === "bar" || style === "both") && (
        <LoadingBar isLoading={isLoading} />
      )}
      {(style === "overlay" || style === "both") && (
        <LoadingOverlay isLoading={isLoading} />
      )}
    </>
  );
}

export function NavigationLoader(props: NavigationLoaderContentProps) {
  return (
    <Suspense fallback={null}>
      <NavigationLoaderContent {...props} />
    </Suspense>
  );
}
