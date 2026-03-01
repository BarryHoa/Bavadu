"use client";

import type { ActionItem } from "@base/client/components/ActionMenu/ActionMenu";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

import ActionMenu from "@base/client/components/ActionMenu/ActionMenu";
import { UserPermissionPopup } from "@base/client/components/UserPermissionPopup";
import { usePermission } from "@base/client/hooks/useHasPermissions";
import { usePermissionsStore } from "@base/client/stores";

/** Row shape from employee list (EmployeeViewListModel / list.getData) */
export type EmployeeListRow = {
  id: string;
  userId: string;
  code?: string;
  employeeCode?: string;
  fullName?: unknown;
  firstName?: string | null;
  lastName?: string | null;
};

export interface EmployeeActionMenuProps {
  row: EmployeeListRow;
  /** Optional: refetch list after permission change */
  onPermissionChange?: () => void;
}

const EMPLOYEE_CREATE = "hrm.employee.create";
const EMPLOYEE_UPDATE = "hrm.employee.update";

export default function EmployeeActionMenu({
  row,
  onPermissionChange,
}: EmployeeActionMenuProps) {
  const t = useTranslations("hrm.employee.list");
  const tPerm = useTranslations("userPermission");
  const isGlobalAdmin = usePermissionsStore((s) => s.isGlobalAdmin);
  const { hasPermission } = usePermission();
  const [permissionOpen, setPermissionOpen] = useState(false);

  const canViewDetail = hasPermission("hrm.employee.view");
  const canCreateEdit =
    hasPermission("hrm.employee.create") ||
    hasPermission("hrm.employee.update");
  const canChangePermission = isGlobalAdmin;

  const displayName =
    typeof row.fullName === "string"
      ? row.fullName
      : ((row.fullName as { en?: string; vi?: string })?.en ??
        (row.fullName as { en?: string; vi?: string })?.vi ??
        row.code ??
        row.employeeCode ??
        row.id);

  const actions = useCallback((): ActionItem[] => {
    const list: ActionItem[] = [];

    if (canViewDetail && row.id) {
      list.push({
        key: "view",
        label: t("view"),
        href: `/workspace/modules/hrm/employees/view/${row.id}`,
      });
    }

    if (canCreateEdit && row.id) {
      list.push({
        key: "edit",
        label: t("edit"),
        href: `/workspace/modules/hrm/employees/edit/${row.id}`,
      });
    }

    if (
      canChangePermission &&
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
    canViewDetail,
    canCreateEdit,
    canChangePermission,
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
