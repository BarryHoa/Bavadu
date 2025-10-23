import { loadMenusFromModules } from "../../lib/menu-loader";
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
