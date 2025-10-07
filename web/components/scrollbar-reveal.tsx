"use client";

import { useEffect } from "react";

export default function ScrollbarReveal() {
  useEffect(() => {
    const show = (el: HTMLElement) => {
      el.classList.add("show-scrollbar");
      window.clearTimeout((el as any)._sbTimer);
      (el as any)._sbTimer = window.setTimeout(() => {
        el.classList.remove("show-scrollbar");
      }, 800); // hide after idle
    };

    const attach = (el: HTMLElement) => {
      const handler = () => show(el);
      el.addEventListener("scroll", handler, { passive: true });
      el.addEventListener("mousemove", handler, { passive: true });
      el.addEventListener("touchstart", handler, { passive: true });
      el.addEventListener("touchmove", handler, { passive: true });
      (el as any)._sbHandler = handler;
    };

    const detach = (el: HTMLElement) => {
      const handler = (el as any)._sbHandler as EventListener | undefined;
      if (handler) {
        el.removeEventListener("scroll", handler as any);
        el.removeEventListener("mousemove", handler as any);
        el.removeEventListener("touchstart", handler as any);
        el.removeEventListener("touchmove", handler as any);
      }
    };

    const isScrollable = (el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      const overflowX = style.overflowX;
      const canScrollY =
        (overflowY === "auto" || overflowY === "scroll") &&
        el.scrollHeight > el.clientHeight;
      const canScrollX =
        (overflowX === "auto" || overflowX === "scroll") &&
        el.scrollWidth > el.clientWidth;
      return canScrollY || canScrollX;
    };

    const ensureOverlay = (root: ParentNode | Document = document) => {
      const all = Array.from(root.querySelectorAll<HTMLElement>("*"));
      all.forEach((el) => {
        if (isScrollable(el)) {
          if (!el.classList.contains("scroll-overlay"))
            el.classList.add("scroll-overlay");
          attach(el);
        }
      });
    };

    ensureOverlay();

    // Watch DOM changes for dynamically added containers
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          if (isScrollable(node)) {
            if (!node.classList.contains("scroll-overlay"))
              node.classList.add("scroll-overlay");
            attach(node);
          }
          // Also scan descendants if a subtree is added
          ensureOverlay(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Re-evaluate on resize (content may change scrollability)
    const onResize = () => ensureOverlay();
    window.addEventListener("resize", onResize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      // Detach from existing overlays
      document.querySelectorAll<HTMLElement>(".scroll-overlay").forEach(detach);
    };
  }, []);

  return null;
}
