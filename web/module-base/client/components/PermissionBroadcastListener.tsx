"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import userService from "@base/client/services/UserService";
import {
  getPermissionsStoreState,
  PERMISSION_BROADCAST_CHANNEL,
} from "@base/client/stores/permission-store";

/**
 * Listens to BroadcastChannel for cross-tab permission sync:
 * - "clear": user logged out in another tab → clear local store
 * - "refresh": user logged in in another tab → refetch and set store
 * Mount once inside QueryClientProvider (e.g. in app/providers).
 */
export function PermissionBroadcastListener() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = new BroadcastChannel(PERMISSION_BROADCAST_CHANNEL);

    channel.onmessage = (event: MessageEvent<{ type?: string }>) => {
      const type = event.data?.type;

      if (type === "clear") {
        getPermissionsStoreState().clearPermissions();
        // Tab khác (không phải tab đang bấm logout): thử đóng. Trình duyệt chỉ cho đóng tab mở bằng JS (window.open).
        // Nếu không đóng được, sau 200ms fallback: redirect về login để không giữ trang cũ.
        if (typeof window !== "undefined") {
          window.close();
          // Nếu trình duyệt chặn close (tab do user mở), sau 200ms vẫn còn đây → redirect về login
          setTimeout(() => {
            if (!window.location.pathname.startsWith("/login")) {
              window.location.replace("/login");
            }
          }, 200);
        }
        return;
      }

      if (type === "refresh") {
        queryClient
          .fetchQuery({
            queryKey: ["meWithRoles"],
            queryFn: () => userService.getMeWithRoles(),
          })
          .then((res) => {
            if (res?.data) {
              getPermissionsStoreState().setPermissions(res.data);
              // Tab khác (vd đang mở /login) → chuyển về trang mặc định để refresh vào app
              if (
                typeof window !== "undefined" &&
                window.location.pathname.startsWith("/login")
              ) {
                window.location.replace("/workspace/news");
              }
            }
          })
          .catch(() => {
            // ignore
          });
      }
    };

    return () => channel.close();
  }, [queryClient]);

  return null;
}
