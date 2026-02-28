"use client";

import type { ActionItem } from "@base/client/components/ActionMenu/ActionMenu";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import { UserPermissionPopup } from "@base/client/components/UserPermissionPopup";
import { useCurrentUserCapabilities } from "@base/client/hooks/useCurrentUserCapabilities";

type EmployeeRow = {
  id: string;
  userId?: string | null;
  code?: string;
  fullName?: unknown;
};

export interface EmployeeActionMenuProps {
  row: EmployeeRow;
  /** Optional: refetch list after permission change */
  onPermissionChange?: () => void;
}

export default function EmployeeActionMenu({
  row,
  onPermissionChange,
}: EmployeeActionMenuProps) {
  const t = useTranslations("hrm.employee.list");
  const tPerm = useTranslations("userPermission");
  const capabilities = useCurrentUserCapabilities();
  const [permissionOpen, setPermissionOpen] = useState(false);

  const displayName =
    typeof row.fullName === "string"
      ? row.fullName
      : ((row.fullName as { en?: string; vi?: string })?.en ??
        (row.fullName as { en?: string; vi?: string })?.vi ??
        row.code ??
        row.id);

  const actions = useCallback((): ActionItem[] => {
    const list: ActionItem[] = [];

    if (capabilities.canViewDetail && row.id) {
      list.push({
        key: "view",
        label: t("view"),
        href: `/workspace/modules/hrm/employees/view/${row.id}`,
      });
    }

    if (capabilities.canCreateEdit && row.id) {
      list.push({
        key: "edit",
        label: t("edit"),
        href: `/workspace/modules/hrm/employees/edit/${row.id}`,
      });
    }

    if (
      capabilities.canChangePermission &&
      row.userId &&
      list.some((a) => a.key === "view")
    ) {
      list.push({
        key: "permission",
        label: tPerm("title"),
        onPress: () => setPermissionOpen(true),
      });
    }

    return list;
  }, [
    capabilities.canViewDetail,
    capabilities.canCreateEdit,
    capabilities.canChangePermission,
    row.id,
    row.userId,
    t,
    tPerm,
  ]);

  const menuActions = actions();

  if (menuActions.length === 0) return null;

  return (
    <>
      <ActionMenu actions={menuActions} />
      {row.userId && (
        <UserPermissionPopup
          displayName={String(displayName)}
          isOpen={permissionOpen}
          userId={row.userId}
          onClose={() => setPermissionOpen(false)}
          onSuccess={onPermissionChange}
        />
      )}
    </>
  );
}
