"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { IBaseDigitViewer } from "@base/client/components";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";
import { courseService } from "@mdl/hrm/client/services/CourseService";

const COURSES_LIST_PATH = "/workspace/modules/hrm/courses";

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

  const breadcrumbs = useMemo(
    () =>
      courseData
        ? [
            { label: t("title"), href: COURSES_LIST_PATH },
            {
              label:
                getLocalizedText(courseData.name as any) || courseData.code || t("generalInfo"),
            },
          ]
        : [
            { label: t("title"), href: COURSES_LIST_PATH },
            { label: isLoading ? "..." : tCommon("errors.dataNotFound") },
          ],
    [t, courseData, isLoading, tCommon, getLocalizedText],
  );

  useSetBreadcrumbs(breadcrumbs);

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
          color="danger"
          size="sm"
          variant="bordered"
          onPress={() => refetch()}
        >
          Retry
        </IBaseButton>
      </div>
    );
  }

  const titleLabel =
    getLocalizedText(courseData.name as any) || courseData.code || t("generalInfo");
  const subtitle = courseData.code || undefined;
  const editPath = `${COURSES_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
      headerActions={
        <IBaseButton
          color="primary"
          size="sm"
          startContent={<Pencil className="size-4" />}
          onPress={() => router.push(editPath)}
        >
          {tCommon("actions.edit")}
        </IBaseButton>
      }
      maxWidth="content"
      subtitle={subtitle}
      title={titleLabel}
      variant="detail"
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-6 p-6">
          <h2 className="text-lg font-semibold text-foreground">{t("generalInfo")}</h2>
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
    </IBasePageLayout>
  );
}
