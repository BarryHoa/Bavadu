"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { departmentService } from "@mdl/hrm/client/services/DepartmentService";

import DepartmentForm, {
  type DepartmentFormValues,
} from "../components/DepartmentForm/DepartmentForm";

export default function DepartmentCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.department.create.labels");

  const {
    handleSubmit: submitDepartment,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof departmentService.create>[0],
    { id: string }
  >({
    mutationFn: async (payload) => {
      const response = await departmentService.create(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreate"));
      }

      return response.data;
    },
    invalidateQueries: [["hrm-departments"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/departments/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: DepartmentFormValues) => {
    const payload = {
      code: values.code.trim(),
      name: values.name || { vi: "", en: "" },
      description: values.description || null,
      parentId: values.parentId?.trim() || null,
      level: values.level ? Number(values.level) : null,
      managerId: values.managerId?.trim() || null,
      locationId: values.locationId?.trim() || null,
      isActive: values.isActive ?? true,
    };

    await submitDepartment(payload);
  };

  return (
    <DepartmentForm
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push("/workspace/modules/hrm/departments")}
      onSubmit={handleSubmit}
    />
  );
}
