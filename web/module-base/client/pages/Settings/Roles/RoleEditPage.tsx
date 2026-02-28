"use client";

import type { LocalizeText } from "@base/client/interface/LocalizeText";

import { addToast } from "@heroui/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseInput,
  IBaseInputMultipleLang,
  IBasePageLayout,
} from "@base/client/components";
import { useSetBreadcrumbs } from "@base/client/hooks";
import roleService, {
  type UpdateRoleRequest,
} from "@base/client/services/RoleService";

import RolePermissionMatrix from "./components/RolePermissionMatrix";

const PERMISSIONS_QUERY_KEY = ["settings", "permissions", "list"] as const;
const ROLE_QUERY_KEY = (id: string) =>
  ["settings", "roles", "get", id] as const;
const ROLES_LIST_QUERY_KEY = ["settings", "roles", "list"] as const;
const ROLES_LIST_PATH = "/workspace/settings/roles";

export default function RoleEditPage() {
  const t = useTranslations("settings.roles");
  const actionsT = useTranslations("common.actions");
  const errorsT = useTranslations("common.errors");
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [code, setCode] = useState("");
  const [name, setName] = useState<LocalizeText>({
    en: undefined,
    vi: undefined,
  });
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<string>
  >(new Set());
  const [adminModules, setAdminModules] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleQuery = useQuery({
    queryKey: ROLE_QUERY_KEY(id),
    queryFn: async () => {
      const response = await roleService.getRole(id);

      return response.data;
    },
    enabled: !!id,
  });

  const permissionsQuery = useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await roleService.getPermissionList();

      return response.data;
    },
  });

  const role = roleQuery.data;
  const breadcrumbs = useMemo(
    () => [
      { label: t("listTitle"), href: ROLES_LIST_PATH },
      { label: role ? t("edit.title") : t("loading") },
    ],
    [t, role],
  );

  useSetBreadcrumbs(breadcrumbs);

  useEffect(() => {
    if (roleQuery.data) {
      const data = roleQuery.data;

      setCode(data.code);
      setName(data.name);
      setDescription(data.description || "");
      setSelectedPermissionIds(
        new Set(data.permissions ? data.permissions.map((p) => p.id) : []),
      );
      setAdminModules(data.isAdminModules ?? {});
    }
  }, [roleQuery.data]);

  const updateRoleMutation = useMutation({
    mutationFn: (payload: UpdateRoleRequest) => roleService.updateRole(payload),
    onSuccess: () => {
      addToast({
        title: t("toast.updateSuccess"),
        color: "success",
        variant: "solid",
      });
      queryClient.invalidateQueries({ queryKey: ROLES_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEY(id) });
      router.push(ROLES_LIST_PATH);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t("toast.updateError");

      addToast({
        title: errorMessage,
        color: "danger",
        variant: "solid",
      });
    },
  });

  const validate = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!code.trim()) {
      newErrors.code = errorsT("required");
    } else if (!/^[a-z0-9_]+$/.test(code)) {
      newErrors.code = t("form.codeInvalid");
    }

    if (!name || (!name.en && !name.vi)) {
      newErrors.name = errorsT("required");
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }, [code, name, errorsT, t]);

  const handleSubmit = useCallback(() => {
    if (!validate()) {
      return;
    }

    updateRoleMutation.mutate({
      id,
      code: code.trim(),
      name,
      description: description.trim() || undefined,
      permissionIds:
        selectedPermissionIds.size > 0
          ? Array.from(selectedPermissionIds)
          : undefined,
      isAdminModules: adminModules,
    });
  }, [
    id,
    code,
    name,
    description,
    selectedPermissionIds,
    adminModules,
    validate,
    updateRoleMutation,
  ]);

  const permissions = permissionsQuery.data ?? [];

  if (roleQuery.isLoading) {
    return (
      <IBasePageLayout title={t("loading")} variant="edit">
        <IBaseCard>
          <IBaseCardBody>
            <p>{t("loading")}</p>
          </IBaseCardBody>
        </IBaseCard>
      </IBasePageLayout>
    );
  }

  if (!role) {
    return (
      <IBasePageLayout title={t("notFound")} variant="edit">
        <IBaseCard>
          <IBaseCardBody>
            <p>{t("notFound")}</p>
          </IBaseCardBody>
        </IBaseCard>
      </IBasePageLayout>
    );
  }

  if (role.isSystem) {
    return (
      <IBasePageLayout title={t("edit.title")} variant="edit">
        <IBaseCard>
          <IBaseCardBody>
            <p>{t("cannotEditSystemRole")}</p>
          </IBaseCardBody>
        </IBaseCard>
      </IBasePageLayout>
    );
  }

  return (
    <IBasePageLayout maxWidth="full" title={t("edit.title")} variant="edit">
      <IBaseCard>
        <IBaseCardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <IBaseInput
              isRequired
              description={t("form.codeDescription")}
              errorMessage={errors.code}
              isInvalid={!!errors.code}
              label={t("form.code")}
              value={code}
              onValueChange={setCode}
            />
            <IBaseInputMultipleLang
              isRequired
              errorMessage={errors.name}
              isInvalid={!!errors.name}
              label={t("form.name")}
              value={name}
              onValueChange={setName as (value: LocalizeText) => void}
            />
            <div className="md:col-span-2">
              <IBaseInput
                description={t("form.descriptionDescription")}
                label={t("form.description")}
                value={description}
                onValueChange={setDescription}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-foreground">
                {t("form.defaultPermissions")}
              </label>
              <RolePermissionMatrix
                adminModules={adminModules}
                isLoading={permissionsQuery.isLoading}
                permissions={permissions}
                selectedIds={selectedPermissionIds}
                onAdminModulesChange={setAdminModules}
                onSelectionChange={setSelectedPermissionIds}
              />
            </div>
          </div>

          {/* §22.3: Nút chính ở cuối form; §22.4: Full-page Primary trái, Cancel phải */}
          <div className="flex flex-wrap items-center gap-3 border-t border-default-200 pt-6">
            <IBaseButton
              color="primary"
              isLoading={updateRoleMutation.isPending}
              size="md"
              onPress={handleSubmit}
            >
              {actionsT("save")}
            </IBaseButton>
            <IBaseButton
              size="md"
              variant="light"
              onPress={() => router.push(ROLES_LIST_PATH)}
            >
              {actionsT("cancel")}
            </IBaseButton>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
