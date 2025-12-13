"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { employeeService } from "@mdl/hrm/client/services/EmployeeService";
import EmployeeForm, {
  type EmployeeFormValues,
} from "../components/EmployeeForm/EmployeeForm";

export default function EmployeeCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.employee.create.labels");

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
      router.push(`/workspace/modules/hrm/employees/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: EmployeeFormValues) => {
    const payload = {
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

    await submitEmployee(payload);
  };

  return (
    <EmployeeForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/workspace/modules/hrm/employees")}
      submitError={submitError}
      isSubmitting={isPending}
    />
  );
}

