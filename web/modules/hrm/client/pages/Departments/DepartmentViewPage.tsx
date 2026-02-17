"use client";

import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { formatDate } from "@base/client/utils/date/formatDate";
import { departmentService } from "@mdl/hrm/client/services/DepartmentService";
import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseChip,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";

const DEPARTMENTS_LIST_PATH = "/workspace/modules/hrm/departments";

export default function DepartmentViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.department.view.labels");
  const tTitle = useTranslations("hrm.department");
  const getLocalizedText = useLocalizedText();

  const {
    data: department,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-department", id],
    queryFn: async () => {
      const response = await departmentService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? "Department not found");
      }

      return response.data;
    },
    enabled: !!id,
  });

  const breadcrumbs = useMemo(
    () =>
      department
        ? [
            { label: tTitle("title"), href: DEPARTMENTS_LIST_PATH },
            {
              label:
                getLocalizedText(department.name as any) || department.code,
            },
          ]
        : [
            { label: tTitle("title"), href: DEPARTMENTS_LIST_PATH },
            { label: isLoading ? "..." : t("notFound") },
          ],
    [department, isLoading, tTitle, t, getLocalizedText]
  );

  useSetBreadcrumbs(breadcrumbs);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>{t("loading")}</span>
      </div>
    );
  }

  if (isError || !department) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : t("notFound")}
        </p>
        <IBaseButton
          color="danger"
          size="sm"
          variant="bordered"
          onPress={() => refetch()}
        >
          Retry
        </IBaseButton>
      </div>
    );
  }

  const departmentName =
    getLocalizedText(department.name as any) || department.code;
  const editPath = `${DEPARTMENTS_LIST_PATH}/edit/${id}`;
  const subtitle = `${t("code")}: ${department.code}${department.level != null ? ` · ${t("level")}: ${department.level}` : ""}`;

  return (
    <IBasePageLayout
      headerActions={
        <IBaseButton
          color="primary"
          size="md"
          startContent={<Pencil size={16} />}
          onPress={() => router.push(editPath)}
        >
          {t("edit")}
        </IBaseButton>
      }
      maxWidth="content"
      subtitle={subtitle}
      title={
        <span className="flex flex-wrap items-center gap-2">
          {departmentName}
          <IBaseChip
            color={department.isActive ? "success" : "default"}
            size="sm"
            variant="flat"
          >
            {department.isActive ? t("statusActive") : t("statusInactive")}
          </IBaseChip>
        </span>
      }
      variant="detail"
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
          <IBaseCardBody className="gap-6 p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t("basicInfo")}
              </h2>
            </div>

            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-default-500">
                  {t("code")}
                </dt>
                <dd className="mt-1 text-base text-foreground">
                  {department.code}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-default-500">
                  {t("name")}
                </dt>
                <dd className="mt-1 text-base text-foreground">
                  {departmentName}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-default-500">
                  {t("parentDepartment")}
                </dt>
                <dd className="mt-1 text-base text-foreground">
                  {getLocalizedText(department.parent?.name as any) || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-default-500">
                  {t("level")}
                </dt>
                <dd className="mt-1 text-base text-foreground">
                  {department.level?.toString() ?? "—"}
                </dd>
              </div>
            </dl>

            {department.description ? (
              <div className="border-t border-default-200 pt-5">
                <dt className="text-sm font-medium text-default-500">
                  {t("description")}
                </dt>
                <dd className="mt-2 text-base text-foreground leading-relaxed">
                  {getLocalizedText(department.description as any)}
                </dd>
              </div>
            ) : null}

            {(department.createdAt || department.updatedAt) ? (
              <div className="flex flex-wrap gap-4 border-t border-default-200 pt-5 text-xs text-default-500">
                {department.createdAt ? (
                  <span>Created: {formatDate(department.createdAt)}</span>
                ) : null}
                {department.updatedAt ? (
                  <span>Updated: {formatDate(department.updatedAt)}</span>
                ) : null}
              </div>
            ) : null}
          </IBaseCardBody>
        </IBaseCard>
    </IBasePageLayout>
  );
}
