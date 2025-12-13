"use client";

import { IBaseInput, IBaseInputMultipleLang, IBaseSelect, SelectItem } from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import roleService, { type Permission } from "@base/client/services/RoleService";
import type { LocalizeText } from "@base/client/interface/LocalizeText";

const PERMISSIONS_QUERY_KEY = ["settings", "permissions", "list"] as const;
const ROLES_LIST_QUERY_KEY = ["settings", "roles", "list"] as const;

export default function RoleCreatePage() {
  const t = useTranslations("settings.roles");
  const actionsT = useTranslations("common.actions");
  const errorsT = useTranslations("common.errors");
  const queryClient = useQueryClient();
  const router = useRouter();

  const [code, setCode] = useState("");
  const [name, setName] = useState<LocalizeText>({});
  const [description, setDescription] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

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
      setToast({ message: t("toast.createSuccess"), type: "success" });
      queryClient.invalidateQueries({ queryKey: ROLES_LIST_QUERY_KEY });
      setTimeout(() => {
        router.push("/settings/roles");
      }, 1500);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t("toast.createError");
      setToast({ message: errorMessage, type: "error" });
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
      permissionIds: selectedPermissionIds.length > 0 ? selectedPermissionIds : undefined,
    });
  }, [code, name, description, selectedPermissionIds, validate, createRoleMutation]);

  const permissions = permissionsQuery.data ?? [];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("create.title")}</h2>
          <div className="flex gap-2">
            <Button
              variant="light"
              onPress={() => router.push("/settings/roles")}
            >
              {actionsT("cancel")}
            </Button>
            <Button
              color="primary"
              onPress={handleSubmit}
              isLoading={createRoleMutation.isPending}
            >
              {actionsT("save")}
            </Button>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <IBaseInput
              label={t("form.code")}
              value={code}
              onValueChange={setCode}
              errorMessage={errors.code}
              isInvalid={!!errors.code}
              isRequired
              description={t("form.codeDescription")}
            />
            <IBaseInputMultipleLang
              label={t("form.name")}
              value={name}
              onValueChange={setName}
              errorMessage={errors.name}
              isInvalid={!!errors.name}
              isRequired
            />
            <div className="md:col-span-2">
              <IBaseInput
                label={t("form.description")}
                value={description}
                onValueChange={setDescription}
                description={t("form.descriptionDescription")}
              />
            </div>
            <div className="md:col-span-2">
              <IBaseSelect
                label={t("form.defaultPermissions")}
                selectionMode="multiple"
                selectedKeys={selectedPermissionIds}
                onSelectionChange={(keys) => {
                  setSelectedPermissionIds(Array.from(keys) as string[]);
                }}
                description={t("form.permissionsDescription")}
                placeholder={t("form.selectPermissions")}
                isLoading={permissionsQuery.isLoading}
              >
                {permissions.map((permission) => (
                  <SelectItem key={permission.id} textValue={permission.key}>
                    {permission.key} - {permission.module}.{permission.resource}.{permission.action}
                  </SelectItem>
                ))}
              </IBaseSelect>
            </div>
          </div>
        </CardBody>
      </Card>
      {toast && (
        <div className="fixed right-4 top-4 z-50 flex max-w-sm flex-col gap-2">
          <div
            className={`rounded-medium px-4 py-3 text-sm shadow-large ${
              toast.type === "error"
                ? "bg-danger-100 text-danger"
                : "bg-success-100 text-success"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

