"use client";

import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";
import { useCreateUpdate, useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { courseService } from "@mdl/hrm/client/services/CourseService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import CourseForm, {
  type CourseFormValues,
} from "./components/CourseForm/CourseForm";

const COURSES_LIST_PATH = "/workspace/modules/hrm/courses";

export default function CourseEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.courses");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: courseData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-courses", id],
    queryFn: async () => {
      const response = await courseService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToLoadCourse"));
      }

      return response.data;
    },
    enabled: !!id,
  });

  const {
    handleSubmit: submitCourse,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof courseService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await courseService.update(payload);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToUpdateCourse"));
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-courses"], ["hrm-courses", id]],
    onSuccess: (data) => {
      router.push(`${COURSES_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const viewPath = `${COURSES_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () =>
      courseData
        ? [
            { label: t("title"), href: COURSES_LIST_PATH },
            {
              label:
                getLocalizedText(courseData.name as any) ||
                courseData.code ||
                t("edit"),
              href: viewPath,
            },
            { label: t("edit") },
          ]
        : [
            { label: t("title"), href: COURSES_LIST_PATH },
            { label: t("edit") },
          ],
    [t, courseData, viewPath, getLocalizedText],
  );
  useSetBreadcrumbs(breadcrumbs);

  const handleSubmit = async (values: CourseFormValues) => {
    await submitCourse({
      id,
      code: values.code.trim(),
      name: values.name || { vi: "", en: "" },
      description: values.description || null,
      category: values.category?.trim() || null,
      duration: values.duration || null,
      format: values.format?.trim() || null,
      instructor: values.instructor?.trim() || null,
      isActive: values.isActive === "true",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>{tCommon("loading")}</span>
      </div>
    );
  }

  if (isError || !courseData) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : tCommon("errors.dataNotFound")}
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

  const subtitle = courseData.code || undefined;

  return (
    <IBasePageLayout
      variant="edit"
      maxWidth="form"
      title={t("edit")}
      subtitle={subtitle}
    >
      <CourseForm
      defaultValues={{
        code: courseData?.code || "",
        name: (courseData?.name as any) || { vi: "", en: "" },
        description: courseData?.description as any,
        category: courseData?.category || "",
        duration: courseData?.duration ?? undefined,
        format: courseData?.format || "",
        instructor: courseData?.instructor || "",
        isActive: courseData?.isActive ? "true" : "false",
      }}
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
