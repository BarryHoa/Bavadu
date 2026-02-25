"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import {
  IBaseButton,
  IBaseCheckbox,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import JsonRpcClientService from "@base/client/services/JsonRpcClientService";
import userRoleService from "@base/client/services/UserRoleService";
import { addToast } from "@heroui/toast";

export interface UserPermissionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  displayName?: string;
  onSuccess?: () => void;
}

const rpc = new JsonRpcClientService();

export function UserPermissionPopup({
  isOpen,
  onClose,
  userId,
  displayName,
  onSuccess,
}: UserPermissionPopupProps) {
  const t = useTranslations("common");
  const tPerm = useTranslations("userPermission");
  const getLocalizedText = useLocalizedText();
  const queryClient = useQueryClient();
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const { data: userRoles = [], isLoading: loadingRoles } = useQuery({
    queryKey: ["userRoles", userId],
    queryFn: () => userRoleService.getRolesForUser(userId),
    enabled: isOpen && !!userId,
  });

  const { data: roleListData, isLoading: loadingRolesList } = useQuery({
    queryKey: ["roleList"],
    queryFn: () =>
      rpc.call<{ data: { id: string; code: string; name: unknown }[] }>(
        "base-role.list.getData",
        { page: 1, pageSize: 200 },
      ),
    enabled: isOpen,
  });

  const allRoles = useMemo(
    () => roleListData?.data ?? [],
    [roleListData],
  );

  const initialSelected = useMemo(
    () => new Set(userRoles.map((r) => r.roleId)),
    [userRoles],
  );

  const currentSelected = useMemo(() => {
    if (selectedRoleIds.size > 0) return selectedRoleIds;
    return initialSelected;
  }, [initialSelected, selectedRoleIds]);

  const toggleRole = useCallback((roleId: string, checked: boolean) => {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(roleId);
      else next.delete(roleId);
      return next;
    });
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSelectedRoleIds(new Set());
        onClose();
      }
    },
    [onClose],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const toAdd = [...currentSelected].filter((id) => !initialSelected.has(id));
      const toRemove = [...initialSelected].filter((id) => !currentSelected.has(id));

      for (const roleId of toAdd) {
        await userRoleService.assignRoleToUser({ userId, roleId });
      }
      for (const roleId of toRemove) {
        await userRoleService.revokeRoleFromUser({ userId, roleId });
      }

      await queryClient.invalidateQueries({ queryKey: ["userRoles", userId] });
      addToast({
        title: tPerm("saved"),
        type: "success",
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      addToast({
        title: tPerm("saveFailed"),
        description: err instanceof Error ? err.message : undefined,
        type: "danger",
      });
    } finally {
      setSaving(false);
    }
  }, [
    currentSelected,
    initialSelected,
    userId,
    queryClient,
    tPerm,
    onSuccess,
    onClose,
  ]);

  const isLoading = loadingRoles || loadingRolesList;
  const title = displayName
    ? tPerm("titleForUser", { name: displayName })
    : tPerm("title");

  return (
    <IBaseModal isOpen={isOpen} onOpenChange={handleOpenChange}>
      <IBaseModalContent>
        <IBaseModalHeader className="flex flex-col gap-1">
          {title}
        </IBaseModalHeader>
        <IBaseModalBody>
          {isLoading ? (
            <p className="text-default-500">{t("loading")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {allRoles.map((role) => (
                <IBaseCheckbox
                  key={role.id}
                  isSelected={currentSelected.has(role.id)}
                  onValueChange={(checked) => toggleRole(role.id, !!checked)}
                >
                  {getLocalizedText(role.name as any) ?? role.code}
                </IBaseCheckbox>
              ))}
              {allRoles.length === 0 && (
                <p className="text-default-500 text-sm">{tPerm("noRoles")}</p>
              )}
            </div>
          )}
        </IBaseModalBody>
        <IBaseModalFooter>
          <IBaseButton variant="flat" onPress={() => handleOpenChange(false)}>
            {t("actions.cancel")}
          </IBaseButton>
          <IBaseButton
            color="primary"
            isLoading={saving}
            isDisabled={isLoading}
            onPress={handleSave}
          >
            {t("actions.save")}
          </IBaseButton>
        </IBaseModalFooter>
      </IBaseModalContent>
    </IBaseModal>
  );
}
