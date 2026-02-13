"use client";

import type { LocalizeText } from "@base/client/interface/LocalizeText";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseInput,
  IBaseInputMultipleLang,
  IBasePageLayout,
} from "@base/client/components";
import RolePermissionMatrix from "./components/RolePermissionMatrix";
import { useSetBreadcrumbs } from "@base/client/hooks";
import roleService from "@base/client/services/RoleService";

import { addToast } from "@heroui/toast";

const PERMISSIONS_QUERY_KEY = ["settings", "permissions", "list"] as const;
const ROLES_LIST_QUERY_KEY = ["settings", "roles", "list"] as const;
const ROLES_LIST_PATH = "/workspace/settings/roles";

export default function RoleCreatePage() {
  const t = useTranslations("settings.roles");
  const actionsT = useTranslations("common.actions");
  const errorsT = useTranslations("common.errors");
  const queryClient = useQueryClient();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [name, setName] = useState<LocalizeText>({
    en: undefined,
    vi: undefined,
  });
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<
    Set<string>
  >(new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});

  const breadcrumbs = useMemo(
    () => [
      { label: t("listTitle"), href: ROLES_LIST_PATH },
      { label: t("create.title") },
    ],
    [t],
  );
  useSetBreadcrumbs(breadcrumbs);

  const permissionsQuery = useQuery({
    queryKey: PERMISSIONS_QUERY_KEY,
    queryFn: async () => {
      const response = await roleService.getPermissionList();

      return response.data;
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (payload: {
      code: string;
      name: LocalizeText;
      description?: string;
      permissionIds?: string[];
    }) => roleService.createRole(payload),
    onSuccess: () => {
      addToast({
        title: t("toast.createSuccess"),
        color: "success",
        variant: "solid",
      });
      queryClient.invalidateQueries({ queryKey: ROLES_LIST_QUERY_KEY });
      router.push(ROLES_LIST_PATH);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t("toast.createError");
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

    createRoleMutation.mutate({
      code: code.trim(),
      name,
      description: description.trim() || undefined,
      permissionIds:
        selectedPermissionIds.size > 0
          ? Array.from(selectedPermissionIds)
          : undefined,
    });
  }, [
    code,
    name,
    description,
    selectedPermissionIds,
    validate,
    createRoleMutation,
  ]);

  const permissions = permissionsQuery.data ?? [];

  return (
    <IBasePageLayout
      variant="create"
      maxWidth="form"
      title={t("create.title")}
    >
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
                permissions={permissions}
                selectedIds={selectedPermissionIds}
                isLoading={permissionsQuery.isLoading}
                onSelectionChange={setSelectedPermissionIds}
              />
            </div>
          </div>

          {/* §22.3: Nút chính ở cuối form; §22.4: Full-page Primary trái, Cancel phải */}
          <div className="flex flex-wrap items-center gap-3 border-t border-default-200 pt-6">
            <IBaseButton
              color="primary"
              isLoading={createRoleMutation.isPending}
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
