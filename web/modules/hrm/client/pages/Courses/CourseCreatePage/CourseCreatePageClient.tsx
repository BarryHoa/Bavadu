"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { courseService } from "@mdl/hrm/client/services/CourseService";

import CourseForm, {
  type CourseFormValues,
} from "../components/CourseForm/CourseForm";

export default function CourseCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.courses");

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
      router.push(`/workspace/modules/hrm/courses/view/${data.data.id}`);
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
    <CourseForm
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push("/workspace/modules/hrm/courses")}
      onSubmit={handleSubmit}
    />
  );
}
