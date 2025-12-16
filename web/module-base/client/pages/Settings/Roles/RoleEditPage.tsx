"use client";

import type { LocalizeText } from "@base/client/interface/LocalizeText";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSelect,
  SelectItem,
} from "@base/client/components";
import roleService from "@base/client/services/RoleService";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const PERMISSIONS_QUERY_KEY = ["settings", "permissions", "list"] as const;
const ROLE_QUERY_KEY = (id: string) =>
  ["settings", "roles", "get", id] as const;
const ROLES_LIST_QUERY_KEY = ["settings", "roles", "list"] as const;

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
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>(
    [],
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{
    message: string;
    type: "error" | "success";
  } | null>(null);

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

  useEffect(() => {
    if (roleQuery.data) {
      const role = roleQuery.data;

      setCode(role.code);
      setName(role.name);
      setDescription(role.description || "");
      setSelectedPermissionIds(
        role.permissions ? role.permissions.map((p) => p.id) : [],
      );
    }
  }, [roleQuery.data]);

  const updateRoleMutation = useMutation({
    mutationFn: (payload: {
      id: string;
      code: string;
      name: LocalizeText;
      description?: string;
      permissionIds?: string[];
    }) => roleService.updateRole(payload),
    onSuccess: () => {
      setToast({ message: t("toast.updateSuccess"), type: "success" });
      queryClient.invalidateQueries({ queryKey: ROLES_LIST_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ROLE_QUERY_KEY(id) });
      setTimeout(() => {
        router.push("/settings/roles");
      }, 1500);
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : t("toast.updateError");

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

    updateRoleMutation.mutate({
      id,
      code: code.trim(),
      name,
      description: description.trim() || undefined,
      permissionIds:
        selectedPermissionIds.length > 0 ? selectedPermissionIds : undefined,
    });
  }, [
    id,
    code,
    name,
    description,
    selectedPermissionIds,
    validate,
    updateRoleMutation,
  ]);

  const role = roleQuery.data;
  const permissions = permissionsQuery.data ?? [];

  if (roleQuery.isLoading) {
    return (
      <Card>
        <CardBody>
          <p>{t("loading")}</p>
        </CardBody>
      </Card>
    );
  }

  if (!role) {
    return (
      <Card>
        <CardBody>
          <p>{t("notFound")}</p>
        </CardBody>
      </Card>
    );
  }

  if (role.isSystem) {
    return (
      <Card>
        <CardBody>
          <p>{t("cannotEditSystemRole")}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t("edit.title")}</h2>
          <div className="flex gap-2">
            <Button
              variant="light"
              onPress={() => router.push("/settings/roles")}
            >
              {actionsT("cancel")}
            </Button>
            <Button
              color="primary"
              isLoading={updateRoleMutation.isPending}
              onPress={handleSubmit}
            >
              {actionsT("save")}
            </Button>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <IBaseSelect
                description={t("form.permissionsDescription")}
                isLoading={permissionsQuery.isLoading}
                label={t("form.defaultPermissions")}
                placeholder={t("form.selectPermissions")}
                selectedKeys={selectedPermissionIds}
                selectionMode="multiple"
                onSelectionChange={(keys) => {
                  setSelectedPermissionIds(Array.from(keys) as string[]);
                }}
              >
                {permissions.map((permission) => (
                  <SelectItem key={permission.id} textValue={permission.key}>
                    {permission.key} - {permission.module}.{permission.resource}
                    .{permission.action}
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
