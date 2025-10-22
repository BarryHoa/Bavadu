"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Breadcrumb, { BreadcrumbItem } from "./components/Breadcrumb";
import Content from "./components/Content";
import MenuPanel from "./components/Menu";
import Nav from "./components/Nav";
import { BreadcrumbProvider } from "./context/breadcrumbs";
import { MenuItem } from "../../lib/menu-loader";

interface SerializedNavigationItem {
  name: string;
  href: string;
  icon: string;
  badge?: string | null;
}

interface WorkspaceLayoutClientProps {
  children: React.ReactNode;
  navigationItems: SerializedNavigationItem[];
  moduleMenus: MenuItem[];
}

export default function WorkspaceLayoutClient({
  children,
  navigationItems,
  moduleMenus,
}: WorkspaceLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const defaultCrumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
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
      <div
        className="w-full h-screen flex flex-col flex-1 overflow-hidden bg-slate-50"
        id="workspace-layout"
      >
        {/* Top header */}
        <Nav onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <MenuPanel
            items={navigationItems}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            moduleMenus={moduleMenus}
          />

          {/* Mobile sidebar overlay */}

          <div className="w-full min-h-0 flex flex-1 h-full overflow-auto scroll-overlay">
            <div className="min-w-3xl flex flex-col flex-1">
              {/* Breadcrumb */}
              <div className="px-2 py-2 font-small rounded-md">
                <Breadcrumb items={initialCrumbs} />
              </div>

              {/* Page content */}
              <div className="flex-1">
                <Content>{children}</Content>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BreadcrumbProvider>
  );
}
