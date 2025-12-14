"use client";

import { LoadingOverlay } from "@base/client/components";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { courseService } from "@mdl/hrm/client/services/CourseService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import CourseForm, {
  type CourseFormValues,
} from "./components/CourseForm/CourseForm";

export default function CourseEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.courses");
  const tCommon = useTranslations("common");

  const {
    data: courseData,
    isLoading,
    isError,
    error,
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
      router.push(`/workspace/modules/hrm/courses/view/${data.data.id}`);
    },
  });

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
    return <LoadingOverlay isLoading={true} />;
  }

  if (isError) {
    return (
      <div className="text-danger-500">
        {tCommon("errors.failedToLoadData")}: {error?.message}
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-warning-500">{tCommon("errors.dataNotFound")}</div>
    );
  }

  return (
    <CourseForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/courses/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
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
    />
  );
}
