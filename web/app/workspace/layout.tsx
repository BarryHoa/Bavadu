import { headers } from "next/headers";

import WorkspaceLayoutClient from "./WorkspaceLayoutClient";
import ModuleI18nProvider from "@/module-base/client/contexts/i18n";

// i18n is provided at module level layouts to avoid loading all messages here

const navigationItems = [
  {
    name: "Profile",
    href: "/workspace/profile",
    icon: "UserCircle",
    badge: null,
  },
  {
    name: "Settings",
    href: "/workspace/settings",
    icon: "Settings",
    badge: null,
  },
];

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const hdrs = await headers();
  const protocol = hdrs.get("x-forwarded-proto") ?? "http";
  const host = hdrs.get("host");
  const baseUrl = `${protocol}://${host}`;
  const workspaceModule = hdrs.get("x-workspace-module");
  const locale = hdrs.get("x-locale")


  const fetchProps = async () => {
    const menusPromise = fetch(`${baseUrl}/api/base/workspace-menu`, {
      cache: "no-store",
    })
      .then(async (res) => (res.ok ? res.json() : { data: [] }))
      .then((json) => json?.data ?? [])
      .catch(() => []);

    // import messages for the workspace module
    const messagesPromise = import(`@mdl/${workspaceModule}/client/messages/${locale}.json`)
      .then((module) => module.default)
      .catch(() => {});

      const commonMessagesPromise = import(`@base/client/messages/${locale}.json`)  .then((module) => module.default)
      .catch(() => {});

    const [menus, messages, commonMessages] = await Promise.all([menusPromise, messagesPromise, commonMessagesPromise]);
    return {
      menus,
      messages: {...commonMessages, ...messages},
    };
  };

  // Fetch menus
  const props = await fetchProps();

  return (
    <ModuleI18nProvider locale={locale ?? "en"} messages={props.messages}> 
      <WorkspaceLayoutClient
        moduleMenus={props.menus}
        navigationItems={navigationItems}
      >
        {children}
      </WorkspaceLayoutClient>
    </ModuleI18nProvider>
  );
}
