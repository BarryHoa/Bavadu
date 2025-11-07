import fs from "fs";
import path from "path";

import { MenuWorkspaceElement } from "@base/client/interface/WorkspaceMenuInterface";

export interface MenuItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  children?: MenuItem[];
}

export function loadMenusFromModules(): MenuWorkspaceElement[] {
  const menus: MenuWorkspaceElement[] = [];
  const modulesPath = path.join(process.cwd(), "modules");

  if (!fs.existsSync(modulesPath)) {
    return menus;
  }

  const moduleDirs = fs
    .readdirSync(modulesPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const moduleDir of moduleDirs) {
    const routerPath = path.join(modulesPath, moduleDir, "client", "menu.json");

    if (fs.existsSync(routerPath)) {
      try {
        const routerContent = fs.readFileSync(routerPath, "utf8");
        const menuData = JSON.parse(routerContent);

        // Recursively update paths to prepend module path
        const updatePaths = (
          items: MenuWorkspaceElement[],
          modulePrefix: string,
        ): MenuWorkspaceElement[] => {
          return items.map((item) => ({
            ...item,
            path: item.path ? `${modulePrefix}${item.path}` : undefined,
            as: item.as ? `${modulePrefix}${item.as}` : undefined,
            children: item.children
              ? updatePaths(item.children, modulePrefix)
              : undefined,
          }));
        };

        const modulePrefix = `/workspace/modules/${moduleDir}`;
        const normalizePath = (path: string) => {
          if (!path) {
            return undefined;
          }

          // remove the last slash if it exists
          return `${modulePrefix}${path.replace(/\/$/, "")}`;
        };
        const processedMenuData: MenuWorkspaceElement = {
          ...menuData,
          path: normalizePath(menuData.path),
          as: normalizePath(menuData.as),
          children: menuData.children
            ? updatePaths(menuData.children, modulePrefix)
            : undefined,
        };

        menus.push(processedMenuData);
      } catch (error) {
        console.error(`Error reading routers.json from ${moduleDir}:`, error);
      }
    }
  }

  return menus;
}
