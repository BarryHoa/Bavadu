"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { employeeService } from "../../../services/EmployeeService";
import EmployeeForm, {
  type EmployeeFormValues,
} from "./components/EmployeeForm/EmployeeForm";

export default function EmployeeEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.employee.create.labels");

  const { data: employeeData, isLoading } = useQuery({
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

  const {
    handleSubmit: updateEmployee,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof employeeService.update>[0],
    { id: string }
  >({
    mutationFn: async (payload) => {
      const response = await employeeService.update({ ...payload, id });
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToUpdate"));
      }
      return response.data;
    },
    invalidateQueries: [["hrm-employees"], ["hrm-employee", id]],
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

    await updateEmployee(payload);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!employeeData) {
    return <div>Employee not found</div>;
  }

  return (
    <EmployeeForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/employees/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
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
    />
  );
}

