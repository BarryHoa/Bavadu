import fs from "fs";
import path from "path";
import { MenuFactoryElm } from "../interfaces/Menu";

export function loadMenusFromModules(): MenuFactoryElm[] {
  const modulesDirectory = path.join(process.cwd(), "modules");

  if (!fs.existsSync(modulesDirectory)) {
    return [];
  }

  const moduleDirs = fs
    .readdirSync(modulesDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const normalizePath = (modulePrefix: string, segment?: string) => {
    if (!segment) return undefined;

    const cleaned = segment.startsWith("/")
      ? segment
      : segment.length > 0
        ? `/${segment}`
        : "/";

    return `${modulePrefix}${cleaned.replace(/\/$/, "") || "/"}`;
  };

  const sortByOrder = (items: MenuFactoryElm[] = []) =>
    [...items].sort((a, b) => {
      const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.order ?? Number.MAX_SAFE_INTEGER;

      if (orderA !== orderB) {
        return orderA - orderB;
      }

      return a.name.localeCompare(b.name);
    });

  const attachPrefix = (
    items: MenuFactoryElm[] = [],
    modulePrefix: string
  ): MenuFactoryElm[] =>
    sortByOrder(items).map((item) => ({
      ...item,
      path: normalizePath(modulePrefix, item.path),
      as: normalizePath(modulePrefix, item.as ?? item.path),
      children: item.children
        ? attachPrefix(item.children, modulePrefix)
        : undefined,
    }));

  const menus: MenuFactoryElm[] = [];

  for (const moduleDir of moduleDirs) {
    const menuFile = path.join(
      modulesDirectory,
      moduleDir,
      "client",
      "menu.json"
    );

    if (!fs.existsSync(menuFile)) {
      continue;
    }

    try {
      const raw = fs.readFileSync(menuFile, "utf8");
      const menuData = JSON.parse(raw) as MenuFactoryElm;
      const modulePrefix = `/workspace/modules/${moduleDir}`;

      menus.push({
        ...menuData,
        path: normalizePath(modulePrefix, menuData.path ?? "/"),
        as: normalizePath(modulePrefix, menuData.as ?? menuData.path ?? "/"),
        children: menuData.children
          ? attachPrefix(menuData.children, modulePrefix)
          : undefined,
      });
    } catch (error) {
      console.error(
        `Error parsing menu.json for module "${moduleDir}":`,
        error
      );
    }
  }

  return sortByOrder(menus);
}
