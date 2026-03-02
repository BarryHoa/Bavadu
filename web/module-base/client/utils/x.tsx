import { UserPermission } from "../interface/RoleAndPermission";

export type MenuFactoryElm = {
  key: string;
  name: string;
  path?: string;
  as?: string;
  icon?: string;
  order?: number;
  /** If set, menu item is shown only when user has this permission key */
  permission?: string;
  children?: MenuFactoryElm[];
  module: string;
  type: "main" | "mdl";
};

/**
 * Filter menu items by user permissions.
 * Items with a "permission" key are kept only when the user has that permission.
 * Items without "permission" are always kept. Children are filtered recursively.
 * Parents with no remaining children (and no path) are removed.
 */
export const filterMenusByPermissions = (
  items: MenuFactoryElm[],
  permissions: UserPermission["permissions"],
  isGlobalAdmin: UserPermission["isGlobalAdmin"],
  adminModules?: UserPermission["adminModules"],
): MenuFactoryElm[] => {
  const permissionsSet = new Set(permissions);
  const adminModulesSet = new Set(adminModules ?? []);
  return items
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
      if (isAccepted || isGlobalAdmin || adminModulesSet.has(item.module)) {
        return item;
      }
      // check permission
      if (item.permission && !permissionsSet.has(item.permission)) {
        return undefined;
      }

      return item;
    })
    .filter((item) => item !== undefined) as MenuFactoryElm[];
};
