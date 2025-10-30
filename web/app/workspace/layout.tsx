import { headers } from "next/headers";

import WorkspaceLayoutClient from "./WorkspaceLayoutClient";

// i18n is provided at module level layouts to avoid loading all messages here

const navigationItems = [
  {
    name: "Profile",
    href: "/workspace/profile",
    icon: "UserCircle",
    badge: null,
  },
  {
    name: "Settings",
    href: "/workspace/settings",
    icon: "Settings",
    badge: null,
  },
];

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host");
  const baseUrl = `${protocol}://${host}`;

  // Fetch menus
  const menusPromise = fetch(`${baseUrl}/api/base/workspace-menu`, {
    cache: "no-store",
  })
    .then(async (res) => (res.ok ? res.json() : { data: [] }))
    .then((json) => json?.data ?? [])
    .catch(() => []);

  const moduleMenus = await menusPromise;

  return (
    <WorkspaceLayoutClient
      moduleMenus={moduleMenus}
      navigationItems={navigationItems}
    >
      {children}
    </WorkspaceLayoutClient>
  );
}
