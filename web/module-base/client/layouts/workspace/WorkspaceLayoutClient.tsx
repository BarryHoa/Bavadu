"use client";

import { WorkspaceProvider } from "@base/client/contexts/workspace";
import { usePrefetchModuleMessages } from "@base/client/hooks/usePrefetchModuleMessages";
import { MenuWorkspaceElement } from "@base/client/interface/WorkspaceMenuInterface";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Breadcrumb from "@base/client/layouts/workspace/components/Breadcrumb";
import Content from "@base/client/layouts/workspace/components/Content";
import MenuPanel from "@base/client/layouts/workspace/components/Menu";
import Nav from "@base/client/layouts/workspace/components/Nav";

interface SerializedNavigationItem {
  name: string;
  href: string;
  icon: string;
  badge?: string | null;
}

interface WorkspaceLayoutClientProps {
  children: React.ReactNode;
  menuItems: MenuWorkspaceElement[];
  allModuleNames: string[];
  currentModule: string | null;
  locale: string;
}

export default function WorkspaceLayoutClient({
  children,
  menuItems,
  allModuleNames,
  currentModule,
  locale,
}: WorkspaceLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Prefetch messages for all other modules
  usePrefetchModuleMessages(allModuleNames, currentModule, locale);

  useEffect(() => {
    const stored = window.localStorage.getItem("workspace_sidebar_pinned");

    setSidebarOpen(stored === "false" ? false : true);
  }, []);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => {
      const next = !prev;

      if (typeof window !== "undefined") {
        window.localStorage.setItem("workspace_sidebar_pinned", String(next));
      }

      return next;
    });
  };

  return (
    <WorkspaceProvider initialBreadcrumbs={[]}>
      <div
        className="w-full h-screen flex flex-col flex-1 overflow-hidden bg-slate-50"
        id="workspace-layout"
      >
        {/* Top header */}
        <Nav />
        <div className="flex min-h-0 flex-1">
          <MenuPanel
            isOpen={sidebarOpen}
            menuItems={menuItems}
            // Desktop menu: không auto đóng, giữ nguyên trạng thái pin/unpin
            onClose={() => {}}
            onToggleSidebar={handleToggleSidebar}
          />

          {/* Mobile sidebar overlay */}

          <div className="w-full min-h-0 flex flex-1 h-full overflow-auto scroll-overlay">
            <div className="min-w-3xl flex flex-col flex-1">
              <Breadcrumb />

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
