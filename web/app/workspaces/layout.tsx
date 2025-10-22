import { loadMenusFromModules } from "../../lib/menu-loader";
import WorkspaceLayoutClient from "./WorkspaceLayoutClient";

const navigationItems = [
  {
    name: "Profile",
    href: "/workspaces/profile",
    icon: "UserCircle",
    badge: null,
  },
  {
    name: "Settings",
    href: "/workspaces/settings",
    icon: "Settings",
    badge: null,
  },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const moduleMenus = loadMenusFromModules();

  return (
    <WorkspaceLayoutClient
      navigationItems={navigationItems}
      moduleMenus={moduleMenus}
    >
      {children}
    </WorkspaceLayoutClient>
  );
}
