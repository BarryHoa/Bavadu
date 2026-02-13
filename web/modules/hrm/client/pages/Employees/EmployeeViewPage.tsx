"use client";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";
import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { employeeService } from "@mdl/hrm/client/services/EmployeeService";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const EMPLOYEES_LIST_PATH = "/workspace/modules/hrm/employees";

export default function EmployeeViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.employee.view.labels");
  const tTitle = useTranslations("hrm.employee");
  const getLocalizedText = useLocalizedText();

  const {
    data: employee,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-employee", id],
    queryFn: async () => {
      const response = await employeeService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? "Employee not found");
      }

      return response.data;
    },
    enabled: !!id,
  });

  const breadcrumbs = useMemo(
    () =>
      employee
        ? [
            { label: tTitle("title"), href: EMPLOYEES_LIST_PATH },
            {
              label:
                getLocalizedText(employee.fullName as any) ||
                employee.employeeCode,
              href: `${EMPLOYEES_LIST_PATH}/view/${id}`,
            },
          ]
        : [
            { label: tTitle("title"), href: EMPLOYEES_LIST_PATH },
            { label: isLoading ? "..." : "Employee" },
          ],
    [employee, id, isLoading, tTitle, getLocalizedText],
  );
  useSetBreadcrumbs(breadcrumbs);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isError || !employee) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : "Employee not found"}
        </p>
        <IBaseButton
          size="sm"
          variant="bordered"
          color="danger"
          onPress={() => refetch()}
        >
          Retry
        </IBaseButton>
      </div>
    );
  }

  const employeeName =
    getLocalizedText(employee.fullName as any) || employee.employeeCode;
  const editPath = `${EMPLOYEES_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
      variant="detail"
      maxWidth="content"
      title={employeeName}
      subtitle={employee.employeeCode}
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
                {t("employeeCode")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {employee.employeeCode}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("fullName")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {employeeName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("email")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {employee.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("phone")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {employee.phone || "—"}
              </dd>
            </div>
          </dl>
        </IBaseCardBody>
      </IBaseCard>

      <IBaseCard className="border border-default-200/60 shadow-sm mt-6">
        <IBaseCardBody className="gap-6 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("employmentInfo")}
            </h2>
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("department")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {getLocalizedText(employee.department?.name as any) || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("position")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {getLocalizedText(employee.position?.name as any) || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("hireDate")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {employee.hireDate || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-default-500">
                {t("employmentStatus")}
              </dt>
              <dd className="mt-1 text-base text-foreground">
                {employee.employmentStatus || "—"}
              </dd>
            </div>
          </dl>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
