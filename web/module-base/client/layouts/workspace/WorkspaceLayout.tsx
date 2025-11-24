import { loadAllMenus } from "@base/server/loaders/menu-loader";
import { getModuleNames } from "@base/server/utils/get-module-names";
import { headers } from "next/headers";

import ModuleI18nProvider from "@base/client/contexts/i18n";
import WorkspaceLayoutClient from "@base/client/layouts/workspace/WorkspaceLayoutClient";
import { MenuWorkspaceElement } from "../../interface/WorkspaceMenuInterface";

// i18n is provided at module level layouts to avoid loading all messages here

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const workspaceModule = hdrs.get("x-workspace-module");
  const locale = hdrs.get("x-locale") ?? "en";

  // Fetch menus
  const menuItems = loadAllMenus() as MenuWorkspaceElement[];

  // Fetch common messages and current module messages
  const [commonMessages, currentModuleMessages] = await Promise.all([
    import(`@base/client/messages/${locale}.json`)
      .then((module) => module.default)
      .catch(() => ({})),
    workspaceModule
      ? import(`@mdl/${workspaceModule}/client/messages/${locale}.json`)
          .then((module) => module.default)
          .catch(() => ({}))
      : Promise.resolve({}),
  ]);

  // Get all module names
  const allModuleNames = getModuleNames();

  // Initial messages structure for zustand
  const initialMessages = {
    common: commonMessages,
    ...(workspaceModule ? { [workspaceModule]: currentModuleMessages } : {}),
  };

  return (
    <ModuleI18nProvider locale={locale} initialMessages={initialMessages}>
      <WorkspaceLayoutClient
        menuItems={menuItems}
        allModuleNames={allModuleNames}
        currentModule={workspaceModule}
        locale={locale}
      >
        {children}
      </WorkspaceLayoutClient>
    </ModuleI18nProvider>
  );
}
