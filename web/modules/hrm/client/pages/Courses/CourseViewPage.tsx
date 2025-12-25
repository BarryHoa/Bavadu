"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { courseService } from "@mdl/hrm/client/services/CourseService";
import { IBaseButton } from "@base/client";
import { IBaseCard, IBaseCardBody } from "@base/client";
import { LoadingOverlay, IBaseDigitViewer } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

export default function CourseViewPage(): React.ReactNode {
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
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex justify-end gap-3 py-2 mb-3 bg-background border-b border-divider -mx-4 px-4">
        <IBaseButton
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/hrm/courses")}
        >
          {tCommon("actions.backToList")}
        </IBaseButton>
        <IBaseButton
          color="primary"
          size="sm"
          onPress={() =>
            router.push(`/workspace/modules/hrm/courses/edit/${id}`)
          }
        >
          {tCommon("actions.edit")}
        </IBaseButton>
      </div>

      <IBaseCard>
        <IBaseCardBody className="p-4">
          <h2 className="text-base font-semibold mb-2">{t("generalInfo")}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <IBaseDigitViewer
              label={t("labels.code")}
              value={courseData.code}
            />
            <IBaseDigitViewer
              label={t("labels.name")}
              value={getLocalizedText(courseData.name)}
            />
            <IBaseDigitViewer
              label={t("labels.category")}
              value={courseData.category || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.duration")}
              value={courseData.duration ? `${courseData.duration} hours` : "—"}
            />
            <IBaseDigitViewer
              label={t("labels.format")}
              value={courseData.format || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.instructor")}
              value={courseData.instructor || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.isActive")}
              value={
                courseData.isActive ? tCommon("active") : tCommon("inactive")
              }
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
