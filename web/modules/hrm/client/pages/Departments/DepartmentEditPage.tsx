"use client";

import {
  useCreateUpdate,
  useLocalizedText,
  useSetBreadcrumbs,
} from "@base/client/hooks";
import { addToast } from "@heroui/toast";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";
import { departmentService } from "@mdl/hrm/client/services/DepartmentService";

import DepartmentForm, {
  type DepartmentFormValues,
} from "./components/DepartmentForm/DepartmentForm";
import { DepartmentPageSidebar } from "./components/DepartmentPageSidebar/DepartmentPageSidebar";

const DEPARTMENTS_LIST_PATH = "/workspace/modules/hrm/departments";

export default function DepartmentEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.department.create.labels");
  const tView = useTranslations("hrm.department.view.labels");
  const tTitle = useTranslations("hrm.department");
  const getLocalizedText = useLocalizedText();

  const { data: departmentData, isLoading, isError, error, refetch } =
    useQuery({
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

  const viewPath = `${DEPARTMENTS_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () =>
      departmentData
        ? [
            { label: tTitle("title"), href: DEPARTMENTS_LIST_PATH },
            {
              label:
                getLocalizedText(departmentData.name as any) ||
                departmentData.code,
              href: viewPath,
            },
            { label: t("editPageTitle") },
          ]
        : [
            { label: tTitle("title"), href: DEPARTMENTS_LIST_PATH },
            { label: t("editPageTitle") },
          ],
    [
      departmentData,
      viewPath,
      tTitle,
      t,
      getLocalizedText,
    ]
  );
  useSetBreadcrumbs(breadcrumbs);

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
        addToast({
          title: t("errors.failedToUpdate"),
          description: response.message ?? t("errors.failedToUpdate"),
          color: "danger",
          variant: "solid",
          timeout: 5000,
        });
        throw new Error(response.message ?? t("errors.failedToUpdate"));
      }

      return { id: response.data.id };
    },
    invalidateQueries: [["hrm-departments"], ["hrm-department", id]],
    onSuccess: (data) => {
      router.push(`${DEPARTMENTS_LIST_PATH}/view/${data.id}`);
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
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>{tView("loading")}</span>
      </div>
    );
  }

  if (isError || !departmentData) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : tView("notFound")}
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

  return (
    <IBasePageLayout
      variant="edit"
      maxWidth="form"
      title={t("editPageTitle")}
      subtitle={departmentData.code}
      sidebar={<DepartmentPageSidebar />}
    >
      <DepartmentForm
        mode="edit"
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
      onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
