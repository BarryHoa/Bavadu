"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import {
  useCreateUpdate,
  useLocalizedText,
  useSetBreadcrumbs,
} from "@base/client/hooks";
import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";
import { employeeService } from "@mdl/hrm/client/services/EmployeeService";

import EmployeeForm, {
  type EmployeeFormValues,
} from "./components/EmployeeForm/EmployeeForm";

const EMPLOYEES_LIST_PATH = "/workspace/modules/hrm/employees";

export default function EmployeeEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.employee.create.labels");
  const tTitle = useTranslations("hrm.employee");
  const getLocalizedText = useLocalizedText();

  const { data: employeeData, isLoading, isError, error, refetch } =
    useQuery({
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

  const viewPath = `${EMPLOYEES_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () =>
      employeeData
        ? [
            { label: tTitle("title"), href: EMPLOYEES_LIST_PATH },
            {
              label:
                getLocalizedText(employeeData.fullName as any) ||
                employeeData.employeeCode,
              href: viewPath,
            },
            { label: t("editPageTitle") },
          ]
        : [
            { label: tTitle("title"), href: EMPLOYEES_LIST_PATH },
            { label: t("editPageTitle") },
          ],
    [employeeData, viewPath, tTitle, t, getLocalizedText],
  );

  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: updateEmployee,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof employeeService.update>[0],
    { id: string }
  >({
    mutationFn: async (payload) => {
      const response = await employeeService.update(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToUpdate"));
      }

      return { id: response.data.id };
    },
    invalidateQueries: [["hrm-employees"], ["hrm-employee", id]],
    onSuccess: (data) => {
      router.push(`${EMPLOYEES_LIST_PATH}/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: EmployeeFormValues) => {
    const payload = {
      id,
      employeeCode: values.employeeCode.trim(),
      firstName: values.firstName?.trim() || null,
      lastName: values.lastName?.trim() || null,
      fullName: values.fullName || { vi: "", en: "" },
      email: values.email?.trim() || null,
      phone: values.phone?.trim() || null,
      dateOfBirth: values.dateOfBirth?.trim() || null,
      gender: values.gender?.trim() || null,
      nationalId: values.nationalId?.trim() || null,
      taxId: values.taxId?.trim() || null,
      address: values.address || null,
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
      isActive: values.isActive ?? true,
    };

    await updateEmployee(payload);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isError || !employeeData) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : "Employee not found"}
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

  return (
    <IBasePageLayout
      maxWidth="form"
      subtitle={employeeData.employeeCode}
      title={t("editPageTitle")}
      variant="edit"
    >
      <EmployeeForm
        defaultValues={{
          employeeCode: employeeData.employeeCode,
          firstName: employeeData.firstName || "",
          lastName: employeeData.lastName || "",
          fullName: (employeeData.fullName as any) || { vi: "", en: "" },
          email: employeeData.email || "",
          phone: employeeData.phone || "",
          dateOfBirth: employeeData.dateOfBirth || "",
          gender: employeeData.gender || "",
          nationalId: employeeData.nationalId || "",
          taxId: employeeData.taxId || "",
          positionId: employeeData.positionId,
          departmentId: employeeData.departmentId,
          managerId: employeeData.managerId || "",
          employmentStatus: employeeData.employmentStatus,
          employmentType: employeeData.employmentType || "",
          hireDate: employeeData.hireDate,
          probationEndDate: employeeData.probationEndDate || "",
          baseSalary: employeeData.baseSalary?.toString() || "",
          currency: employeeData.currency || "VND",
          locationId: employeeData.locationId || "",
          isActive: employeeData.isActive ?? true,
        }}
        isSubmitting={isPending}
        mode="edit"
        submitError={submitError}
        onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
