"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { employeeService } from "@mdl/hrm/client/services/EmployeeService";

import EmployeeForm, {
  type EmployeeFormValues,
} from "../components/EmployeeForm/EmployeeForm";

const EMPLOYEES_LIST_PATH = "/workspace/modules/hrm/employees";

export default function EmployeeCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.employee.create.labels");
  const tTitle = useTranslations("hrm.employee");

  const breadcrumbs = useMemo(
    () => [
      { label: tTitle("title"), href: EMPLOYEES_LIST_PATH },
      { label: t("pageTitle") },
    ],
    [t, tTitle],
  );

  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: submitEmployee,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof employeeService.create>[0],
    { id: string }
  >({
    mutationFn: async (payload) => {
      const response = await employeeService.create(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreate"));
      }

      return response.data;
    },
    invalidateQueries: [["hrm-employees"]],
    onSuccess: (data) => {
      router.push(`${EMPLOYEES_LIST_PATH}/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: EmployeeFormValues) => {
    const payload = {
      userId: values.userId?.trim() || null,
      employeeCode: values.employeeCode.trim(),
      nationalId: values.nationalId?.trim() || null,
      taxId: values.taxId?.trim() || null,
      positionId: values.positionId.trim(),
      departmentId: values.departmentId.trim(),
      managerId: values.managerId?.trim() || null,
      employmentStatus: values.employmentStatus || "active",
      employmentType: values.employmentType?.trim() || null,
      hireDate: values.hireDate.trim(),
      probationEndDate: values.probationEndDate?.trim() || null,
      baseSalary: values.baseSalary ? Number(values.baseSalary) : null,
      currency: values.currency?.trim() || "VND",
      locationId: values.locationId?.trim() || null,
      bankAccount: values.bankAccount?.trim() || null,
      bankName: values.bankName?.trim() || null,
      bankBranch: values.bankBranch?.trim() || null,
      emergencyContactName: values.emergencyContactName?.trim() || null,
      emergencyContactPhone: values.emergencyContactPhone?.trim() || null,
      isActive: values.isActive ?? true,
    };

    await submitEmployee(payload);
  };

  return (
    <IBasePageLayout
      maxWidth="form"
      title={t("pageTitle")}
      variant="create"
    >
      <EmployeeForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(EMPLOYEES_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
