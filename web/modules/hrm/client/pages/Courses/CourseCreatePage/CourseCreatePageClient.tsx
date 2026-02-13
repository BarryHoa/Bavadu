"use client";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { courseService } from "@mdl/hrm/client/services/CourseService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import CourseForm, {
  type CourseFormValues,
} from "../components/CourseForm/CourseForm";

const COURSES_LIST_PATH = "/workspace/modules/hrm/courses";

export default function CourseCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.courses");

  const breadcrumbs = useMemo(
    () => [
      { label: t("title"), href: COURSES_LIST_PATH },
      { label: t("create") },
    ],
    [t],
  );
  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: submitCourse,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof courseService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await courseService.create(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreateCourse"));
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-courses"]],
    onSuccess: (data) => {
      router.push(`${COURSES_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: CourseFormValues) => {
    await submitCourse({
      code: values.code.trim(),
      name: values.name || { vi: "", en: "" },
      description: values.description || null,
      category: values.category?.trim() || null,
      duration: values.duration ?? null,
      format: values.format?.trim() || null,
      instructor: values.instructor?.trim() || null,
      isActive: values.isActive === "true",
    });
  };

  return (
    <IBasePageLayout
      variant="create"
      maxWidth="form"
      title={t("create")}
    >
      <CourseForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(COURSES_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
