"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
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

  const {
    data: employeeData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-employee", id],
    queryFn: async () => {
      const response = await employeeService.getById(id);

      return response;
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
                [employeeData.firstName, employeeData.lastName]
                  .filter(Boolean)
                  .join(" ") || employeeData.employeeCode,
              href: viewPath,
            },
            { label: t("editPageTitle") },
          ]
        : [
            { label: tTitle("title"), href: EMPLOYEES_LIST_PATH },
            { label: t("editPageTitle") },
          ],
    [employeeData, viewPath, tTitle, t],
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
      nationalId: values.nationalId?.trim() || null,
      taxId: values.taxId?.trim() || null,
      positionId: values.positionId.trim(),
      departmentId: values.departmentId.trim(),
      employmentStatus: values.employmentStatus || "active",
      hireDate: values.hireDate?.trim() || null,
      probationEndDate: values.probationEndDate?.trim() || null,
      bankAccount: values.bankAccount?.trim() || null,
      bankName: values.bankName?.trim() || null,
      bankBranch: values.bankBranch?.trim() || null,
      emergencyContactName: values.emergencyContactName?.trim() || null,
      emergencyContactPhone: values.emergencyContactPhone?.trim() || null,
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
          employeeCode: employeeData.employeeCode ?? "",
          firstName: employeeData.firstName ?? "",
          lastName: employeeData.lastName ?? "",
          commonName: employeeData.commonName ?? "",
          emails:
            (employeeData.emails?.length ?? 0) > 0
              ? employeeData.emails!
              : [""],
          phones:
            (employeeData.phones?.length ?? 0) > 0
              ? employeeData.phones!
              : [""],
          nationalId: employeeData.nationalId ?? "",
          taxId: employeeData.taxId ?? "",
          positionId: employeeData.position?.id ?? "",
          departmentId: employeeData.department?.id ?? "",
          employmentStatus: employeeData.status ?? "active",
          hireDate: employeeData.hireDate ?? "",
          probationEndDate: employeeData.probationEndDate ?? "",
          bankAccount: employeeData.bankAccount ?? "",
          bankName: employeeData.bankName ?? "",
          bankBranch: employeeData.bankBranch ?? "",
          emergencyContactName: employeeData.emergencyContactName ?? "",
          emergencyContactPhone: employeeData.emergencyContactPhone ?? "",
          isActive: employeeData.status === "active",
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
