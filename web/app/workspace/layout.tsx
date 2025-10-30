import { headers } from "next/headers";

import WorkspaceLayoutClient from "./WorkspaceLayoutClient";

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
  let moduleMenus = [] as any;

  try {
    const hdrs = await headers();
    const protocol = hdrs.get("x-forwarded-proto") ?? "http";
    const host = hdrs.get("host");
    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api/base/workspace-menu`, {
      cache: "no-store",
      // revalidate: 0, // Alternative in some Next versions
    });

    if (res.ok) {
      const json = await res.json();

      moduleMenus = json?.data ?? [];
    } else {
      moduleMenus = [];
    }
  } catch (error) {
    moduleMenus = [];
    // eslint-disable-next-line no-console
    console.error(error);
  }

  return (
    <WorkspaceLayoutClient
      moduleMenus={moduleMenus}
      navigationItems={navigationItems}
    >
      {children}
    </WorkspaceLayoutClient>
  );
}
