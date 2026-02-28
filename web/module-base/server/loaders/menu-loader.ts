import { existsSync, readFileSync, readdirSync } from "fs";
import { join } from "path";

import { MenuFactoryElm } from "../interfaces/Menu";

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
  modulePrefix: string,
  type: "main" | "mdl",
): MenuFactoryElm[] =>
  sortByOrder(items).map((item) => ({
    ...item,
    type,
    path: normalizePath(modulePrefix, item.path),
    as: normalizePath(modulePrefix, item.as ?? item.path),
    children: item.children
      ? attachPrefix(item.children, modulePrefix, type)
      : undefined,
  }));

/**
 * Load menus from module-base (main menus)
 */
export function loadMenusFromBase(): MenuFactoryElm[] {
  const baseMenuFile = join(
    process.cwd(),
    "module-base",
    "client",
    "menu.json",
  );

  if (!existsSync(baseMenuFile)) {
    return [];
  }

  try {
    const raw = readFileSync(baseMenuFile, "utf8");
    const menuDataArray = JSON.parse(raw) as MenuFactoryElm[];

    if (!Array.isArray(menuDataArray)) {
      console.error("Base menu.json should be an array");

      return [];
    }

    const basePrefix = "/workspace";

    return sortByOrder(
      menuDataArray.map((menuData) => ({
        ...menuData,
        type: "main" as const,
        path: normalizePath(basePrefix, menuData.path ?? "/"),
        as: normalizePath(basePrefix, menuData.as ?? menuData.path ?? "/"),
        children: menuData.children
          ? attachPrefix(menuData.children, basePrefix, "main")
          : undefined,
      })),
    );
  } catch (error) {
    console.error("Error parsing base menu.json:", error);

    return [];
  }
}

/**
 * Load menus from modules (module menus)
 */
export function loadMenusFromModules(): MenuFactoryElm[] {
  const modulesDirectory = join(process.cwd(), "modules");

  if (!existsSync(modulesDirectory)) {
    return [];
  }

  const moduleDirs = readdirSync(modulesDirectory, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const menus: MenuFactoryElm[] = [];

  for (const moduleDir of moduleDirs) {
    const menuFile = join(modulesDirectory, moduleDir, "client", "menu.json");

    if (!existsSync(menuFile)) {
      continue;
    }

    try {
      const raw = readFileSync(menuFile, "utf8");
      const menuData = JSON.parse(raw) as MenuFactoryElm;
      const modulePrefix = `/workspace/modules/${moduleDir}`;

      menus.push({
        ...menuData,
        module: moduleDir,
        type: "mdl" as const,
        // path: normalizePath(modulePrefix, menuData.path ?? "/"),
        // as: normalizePath(modulePrefix, menuData.as ?? menuData.path ?? "/"),
        children: menuData.children
          ? attachPrefix(menuData.children, modulePrefix, "mdl")
          : undefined,
      });
    } catch (error) {
      console.error(
        `Error parsing menu.json for module "${moduleDir}":`,
        error,
      );
    }
  }

  return sortByOrder(menus);
}

/**
 * Load all menus (base + modules) as a single array
 */
export function loadAllMenus(): MenuFactoryElm[] {
  const menuItems: MenuFactoryElm[] = [];

  // Load base menus (type: "main")
  const baseMenus = loadMenusFromBase();

  menuItems.push(...baseMenus);

  // Load module menus (type: "mdl")
  const moduleMenus = loadMenusFromModules();

  menuItems.push(...moduleMenus);

  return sortByOrder(menuItems);
}

/**
 * Filter menu items by user permissions.
 * Items with a "permission" key are kept only when the user has that permission.
 * Items without "permission" are always kept. Children are filtered recursively.
 * Parents with no remaining children (and no path) are removed.
 */
export const filterMenusByPermissions = (
  items: MenuFactoryElm[],
  permissions: Set<string>,
  isGlobalAdmin: boolean,
  adminModules?: Set<string>,
): MenuFactoryElm[] =>
  items
    ?.map((item) => {
      let isAccepted = false;

      if (item.children) {
        isAccepted = !!filterMenusByPermissions(
          item.children,
          permissions,
          isGlobalAdmin,
          adminModules,
        );
      }
      if (isAccepted || isGlobalAdmin || adminModules?.has(item.module)) {
        return item;
      }
      // check permission
      if (item.permission && !permissions.has(item.permission)) {
        return undefined;
      }

      return item;
    })
    .filter((item) => item !== undefined) as MenuFactoryElm[];
