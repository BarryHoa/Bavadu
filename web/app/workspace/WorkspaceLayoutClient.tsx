"use client";

import { WorkspaceProvider } from "@base/client/contexts/workspace";
import { MenuWorkspaceElement } from "@base/client/interface/WorkspaceMenuInterface";
import { usePathname } from "next/navigation";
import { useState } from "react";

import Breadcrumb, { BreadcrumbItem } from "./components/Breadcrumb";
import Content from "./components/Content";
import MenuPanel from "./components/Menu";
import Nav from "./components/Nav";

interface SerializedNavigationItem {
  name: string;
  href: string;
  icon: string;
  badge?: string | null;
}

interface WorkspaceLayoutClientProps {
  children: React.ReactNode;
  navigationItems: SerializedNavigationItem[];
  moduleMenus: MenuWorkspaceElement[];
}

export default function WorkspaceLayoutClient({
  children,
  navigationItems,
  moduleMenus,
}: WorkspaceLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // const defaultCrumbs: BreadcrumbItem[] = [];
  const parts = (pathname || "/workspace")
    .split("/")
    .filter(Boolean)
    .filter((p) => p !== "modules");

  let acc = "";
  const autoCrumbs: BreadcrumbItem[] = parts.map((p) => {
    acc += `/${p}`;
    const label = p.charAt(0).toUpperCase() + p.slice(1);

    return { label, href: acc };
  });

  const initialCrumbs = [...autoCrumbs];

  // console.log(moduleMenus);
  return (
    <WorkspaceProvider initialBreadcrumbs={initialCrumbs}>
      <div
        className="w-full h-screen flex flex-col flex-1 overflow-hidden bg-slate-50"
        id="workspace-layout"
      >
        {/* Top header */}
        <Nav onOpenSidebar={() => setSidebarOpen(true)} />
        <div className="flex min-h-0 flex-1">
          <MenuPanel
            isOpen={sidebarOpen}
            items={navigationItems as unknown as MenuWorkspaceElement[]}
            moduleMenus={moduleMenus}
            sidebarOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* Mobile sidebar overlay */}

          <div className="w-full min-h-0 flex flex-1 h-full overflow-auto scroll-overlay">
            <div className="min-w-3xl flex flex-col flex-1">
              {/* Breadcrumb */}
              <div className="p-2">
                <Breadcrumb items={initialCrumbs} />
              </div>

              {/* Page content */}
              <div className="flex-1 p-2">
                <Content>{children}</Content>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceProvider>
  );
}
