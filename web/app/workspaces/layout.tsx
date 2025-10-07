"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Link } from "@heroui/link";
import { Divider } from "@heroui/divider";
import {
  LayoutDashboard,
  Settings,
  Users,
  FolderOpen,
  BarChart3,
  Bell,
  Search,
  Menu,
  X,
  Home,
  ChevronRight,
  Moon,
  Sun,
  LogOut,
  User,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

import MenuPanel from "./components/Menu";
import Breadcrumb, { BreadcrumbItem } from "./components/Breadcrumb";
import Nav from "./components/Nav";
import Content from "./components/Content";
import { BreadcrumbProvider } from "./context/breadcrumbs";
import { usePathname } from "next/navigation";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/workspaces/dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    name: "Projects",
    href: "/workspaces/projects",
    icon: FolderOpen,
    badge: "12",
  },
  { name: "Users", href: "/workspaces/users", icon: Users, badge: "5" },
  {
    name: "Analytics",
    href: "/workspaces/analytics",
    icon: BarChart3,
    badge: null,
  },
  {
    name: "Settings",
    href: "/workspaces/settings",
    icon: Settings,
    badge: null,
  },
];

const breadcrumbItems: BreadcrumbItem[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Workspace", href: "/workspaces" },
];

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const defaultCrumbs: BreadcrumbItem[] = [
    { label: "Home", href: "/", icon: Home },
  ];
  const parts = (pathname || "/workspaces").split("/").filter(Boolean);
  let acc = "";
  const autoCrumbs: BreadcrumbItem[] = parts.map((p) => {
    acc += `/${p}`;
    const label = p.charAt(0).toUpperCase() + p.slice(1);
    return { label, href: acc };
  });

  const initialCrumbs = [...defaultCrumbs, ...autoCrumbs];

  return (
    <BreadcrumbProvider initial={initialCrumbs}>
      <div className="w-full h-screen flex flex-col flex-1 overflow-hidden bg-slate-50">
        {/* Top header */}
        <Nav onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <MenuPanel
            items={navigationItems as any}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Mobile sidebar overlay */}

          <div className="w-full min-h-0 flex flex-col h-full overflow-auto scroll-overlay ">
            {/* Breadcrumb */}
            <div className="px-2 py-2 font-small">
              <Breadcrumb items={breadcrumbItems} />
            </div>

            {/* Page content */}
            <div className="flex-1 ">
              <Content>{children}</Content>
            </div>
          </div>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
