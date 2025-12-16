"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { departmentService } from "@mdl/hrm/client/services/DepartmentService";

import DepartmentForm, {
  type DepartmentFormValues,
} from "./components/DepartmentForm/DepartmentForm";

export default function DepartmentEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.department.create.labels");

  const { data: departmentData, isLoading } = useQuery({
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

  const {
    handleSubmit: updateDepartment,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof departmentService.update>[0],
    { id: string }
  >({
    mutationFn: async (payload) => {
      const response = await departmentService.update(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToUpdate"));
      }

      return { id: response.data.id };
    },
    invalidateQueries: [["hrm-departments"], ["hrm-department", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/departments/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: DepartmentFormValues) => {
    const payload = {
      id,
      code: values.code.trim(),
      name: values.name || { vi: "", en: "" },
      description: values.description || null,
      parentId: values.parentId?.trim() || null,
      level: values.level ? Number(values.level) : null,
      managerId: values.managerId?.trim() || null,
      locationId: values.locationId?.trim() || null,
      isActive: values.isActive ?? true,
    };

    await updateDepartment(payload);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!departmentData) {
    return <div>Department not found</div>;
  }

  return (
    <DepartmentForm
      defaultValues={{
        code: departmentData.code,
        name: (departmentData.name as any) || { vi: "", en: "" },
        description: (departmentData.description as any) || undefined,
        parentId: departmentData.parent?.id || "",
        level: departmentData.level?.toString() || "",
        managerId: departmentData.managerId || "",
        locationId: departmentData.locationId || "",
        isActive: departmentData.isActive ?? true,
      }}
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() =>
        router.push(`/workspace/modules/hrm/departments/view/${id}`)
      }
      onSubmit={handleSubmit}
    />
  );
}
