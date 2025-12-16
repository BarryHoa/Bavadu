"use client";

import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import roleService from "@base/client/services/RoleService";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

const ROLE_QUERY_KEY = (id: string) =>
  ["settings", "roles", "get", id] as const;

export default function RoleViewPage() {
  const t = useTranslations("settings.roles");
  const actionsT = useTranslations("common.actions");
  const router = useRouter();
  const params = useParams();
  const getText = useLocalizedText();
  const id = params.id as string;

  const roleQuery = useQuery({
    queryKey: ROLE_QUERY_KEY(id),
    queryFn: async () => {
      const response = await roleService.getRole(id);

      return response.data;
    },
    enabled: !!id,
  });

  const role = roleQuery.data;
  const loading = roleQuery.isLoading;

  if (loading) {
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

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{getText(role.name)}</h2>
          <div className="flex gap-2">
            <Button
              variant="light"
              onPress={() => router.push("/settings/roles")}
            >
              {actionsT("cancel")}
            </Button>
            {!role.isSystem && (
              <Button
                color="primary"
                onPress={() => router.push(`/settings/roles/edit/${role.id}`)}
              >
                {actionsT("edit")}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground-500">
                {t("form.code")}
              </label>
              <p className="mt-1">{role.code}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-500">
                {t("form.name")}
              </label>
              <p className="mt-1">{getText(role.name)}</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-foreground-500">
                {t("form.description")}
              </label>
              <p className="mt-1">{role.description || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-500">
                {t("form.type")}
              </label>
              <p className="mt-1">
                {role.isSystem ? t("form.systemRole") : t("form.customRole")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground-500">
                {t("form.status")}
              </label>
              <p className="mt-1">
                <Chip
                  color={role.isActive ? "success" : "default"}
                  size="sm"
                  variant="flat"
                >
                  {role.isActive ? t("form.active") : t("form.inactive")}
                </Chip>
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground-500 mb-2 block">
              {t("form.defaultPermissions")}
            </label>
            {role.permissions && role.permissions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <Chip key={permission.id} size="sm" variant="flat">
                    {getText(permission.name)} ({permission.key})
                  </Chip>
                ))}
              </div>
            ) : (
              <p className="text-foreground-400">{t("form.noPermissions")}</p>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
