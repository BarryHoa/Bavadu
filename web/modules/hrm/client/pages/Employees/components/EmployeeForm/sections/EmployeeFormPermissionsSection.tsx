"use client";

import type { LocalizeText } from "@base/client";

import { useTranslations } from "next-intl";

import { IBaseCard, IBaseCardBody } from "@base/client";
import { IBaseCheckbox } from "@base/client/components";
import { Permission, Role } from "@base/client/interface/RoleAndPermission";
import RolePermissionMatrix from "@base/client/pages/Settings/Roles/components/RolePermissionMatrix/RolePermissionMatrix";

interface EmployeeFormPermissionsSectionProps {
  roleIds: string[];
  allRoles: Role[];
  allPermissions: Permission[];
  permissionsLoading: boolean;
  selectedPermissionIdsSet: Set<string>;
  onToggleRole: (roleId: string, checked: boolean) => void;
  onPermissionMatrixChange: (selectedIds: Set<string>) => void;
  getLocalizedText: (text: LocalizeText | string | undefined | null) => string;
}

export function EmployeeFormPermissionsSection({
  roleIds,
  allRoles,
  allPermissions,
  permissionsLoading,
  selectedPermissionIdsSet,
  onToggleRole,
  onPermissionMatrixChange,
  getLocalizedText,
}: EmployeeFormPermissionsSectionProps) {
  const t = useTranslations("hrm.employee.create.labels");
  const systemRoles = allRoles.filter((r) => r.isSystem === true);
  const customRoles = allRoles.filter((r) => !r.isSystem);

  const renderRoleCheckboxes = (roles: Role[]) =>
    roles.map((role) => (
      <IBaseCheckbox
        key={role.id}
        isSelected={roleIds.includes(role.id)}
        onValueChange={(checked) => onToggleRole(role.id, !!checked)}
      >
        {getLocalizedText((role?.name as unknown as string) ?? null) ??
          role.code}
      </IBaseCheckbox>
    ));

  return (
    <div className="flex flex-col gap-6">
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-5 px-4 py-4 md:p-5">
          <h2 className="text-lg font-semibold text-foreground">
            {t("selectRoles")}
          </h2>
          {allRoles.length === 0 ? (
            <p className="text-default-500 text-sm">{t("noRoles")}</p>
          ) : (
            <div className="flex flex-col gap-4">
              {systemRoles.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-foreground">
                    {t("rolesSystem")}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {renderRoleCheckboxes(systemRoles)}
                  </div>
                </div>
              )}
              {customRoles.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-foreground">
                    {t("rolesCustom")}
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    {renderRoleCheckboxes(customRoles)}
                  </div>
                </div>
              )}
            </div>
          )}
        </IBaseCardBody>
      </IBaseCard>
      <RolePermissionMatrix
        isLoading={permissionsLoading}
        permissions={allPermissions}
        selectedIds={selectedPermissionIdsSet}
        onSelectionChange={onPermissionMatrixChange}
      />
    </div>
  );
}
