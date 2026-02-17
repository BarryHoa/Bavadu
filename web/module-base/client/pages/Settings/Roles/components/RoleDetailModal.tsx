"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import {
  IBaseButton,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import roleService, {
  type RoleWithPermissions,
} from "@base/client/services/RoleService";

export interface RoleDetailModalProps {
  roleId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoleDetailModal({
  roleId,
  isOpen,
  onClose,
}: RoleDetailModalProps) {
  const t = useTranslations("settings.roles");
  const actionsT = useTranslations("common.actions");
  const getText = useLocalizedText();

  const detailQuery = useQuery({
    queryKey: ["settings", "roles", "detail", roleId],
    queryFn: async () => {
      if (!roleId) {
        throw new Error("Role ID is required");
      }

      const response = await roleService.getRole(roleId);
      return response.data;
    },
    enabled: !!roleId && isOpen,
  });

  const role: RoleWithPermissions | undefined = detailQuery.data;

  return (
    <IBaseModal isOpen={isOpen} size="3xl" onClose={onClose}>
      <IBaseModalContent>
        {(modalOnClose) => (
          <>
            <IBaseModalHeader>{t("detail.title")}</IBaseModalHeader>
            <IBaseModalBody>
              {detailQuery.isLoading && (
                <p className="text-sm text-default-500">{t("loading")}</p>
              )}
              {!detailQuery.isLoading && role && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase text-default-400">
                        {t("form.code")}
                      </p>
                      <p className="text-sm font-semibold text-default-900">
                        {role.code}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-default-400">
                        {t("form.name")}
                      </p>
                      <p className="text-sm font-semibold text-default-900">
                        {getText(role.name as any)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-default-400">
                        {t("form.type")}
                      </p>
                      <p className="text-sm text-default-900">
                        {role.isSystem
                          ? t("table.columns.systemRole")
                          : t("table.columns.customRole")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-default-400">
                        {t("form.status")}
                      </p>
                      <p className="text-sm text-default-900">
                        {role.isActive
                          ? t("table.columns.active")
                          : t("table.columns.inactive")}
                      </p>
                    </div>
                    {role.description && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium uppercase text-default-400">
                          {t("form.description")}
                        </p>
                        <p className="text-sm text-default-900">
                          {role.description}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-medium text-default-800">
                      {t("detail.permissionsTitle")}
                    </p>
                    {role.permissions.length === 0 ? (
                      <p className="text-sm text-default-500">
                        {t("form.noPermissions")}
                      </p>
                    ) : (
                      <div className="max-h-64 overflow-y-auto rounded-md border border-default-200 bg-default-50/40 p-3">
                        <ul className="space-y-1 text-sm">
                          {role.permissions.map((perm) => (
                            <li
                              key={perm.id}
                              className="flex items-center justify-between gap-3 rounded border border-default-100 bg-background px-2 py-1"
                            >
                              <span className="font-mono text-xs text-default-700">
                                {perm.key}
                              </span>
                              <span className="text-xs text-default-500">
                                {perm.module}.{perm.resource}.{perm.action}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </IBaseModalBody>
            <IBaseModalFooter>
              <IBaseButton variant="light" onPress={modalOnClose}>
                {actionsT("close")}
              </IBaseButton>
            </IBaseModalFooter>
          </>
        )}
      </IBaseModalContent>
    </IBaseModal>
  );
}

