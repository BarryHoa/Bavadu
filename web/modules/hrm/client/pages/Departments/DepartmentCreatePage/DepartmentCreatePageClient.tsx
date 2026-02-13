"use client";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { departmentService } from "@mdl/hrm/client/services/DepartmentService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { addToast } from "@heroui/toast";
import DepartmentForm, {
  type DepartmentFormValues,
} from "../components/DepartmentForm/DepartmentForm";
import { DepartmentPageSidebar } from "../components/DepartmentPageSidebar/DepartmentPageSidebar";

const DEPARTMENTS_LIST_PATH = "/workspace/modules/hrm/departments";

export default function DepartmentCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.department.create.labels");
  const tTitle = useTranslations("hrm.department");

  const breadcrumbs = useMemo(
    () => [
      { label: tTitle("title"), href: DEPARTMENTS_LIST_PATH },
      { label: t("pageTitle") },
    ],
    [t, tTitle],
  );
  useSetBreadcrumbs(breadcrumbs);

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
        addToast({
          title: "Failed to create department",
          description: response.message ?? "Failed to create department",
          color: "danger",
          variant: "solid",
          timeout: 5000,
        });
        throw new Error(response.message ?? "Failed to create department");
      }

      return response.data;
    },
    invalidateQueries: [["hrm-departments"]],
    onSuccess: (data) => {
      router.push(`${DEPARTMENTS_LIST_PATH}/view/${data.id}`);
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
    <IBasePageLayout
      variant="create"
      maxWidth="form"
      title={t("pageTitle")}
      sidebar={<DepartmentPageSidebar />}
    >
      <DepartmentForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(DEPARTMENTS_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
