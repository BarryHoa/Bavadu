import fs from "fs";
import path from "path";

export interface MenuItem {
  name: string;
  href: string;
  icon: string;
  badge?: string;
  children?: MenuItem[];
}

export function loadMenusFromModules(): MenuItem[] {
  const menus: MenuItem[] = [];
  const modulesPath = path.join(process.cwd(), "modules");

  if (!fs.existsSync(modulesPath)) {
    return menus;
  }

  const moduleDirs = fs
    .readdirSync(modulesPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const moduleDir of moduleDirs) {
    const routerPath = path.join(modulesPath, moduleDir, "routers.json");

    if (fs.existsSync(routerPath)) {
      try {
        const routerContent = fs.readFileSync(routerPath, "utf8");
        const menuData = JSON.parse(routerContent);
        menus.push(menuData);
      } catch (error) {
        console.error(`Error reading routers.json from ${moduleDir}:`, error);
      }
    }
  }

  return menus;
}
