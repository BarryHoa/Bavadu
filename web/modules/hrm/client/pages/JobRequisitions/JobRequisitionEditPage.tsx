"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import { jobRequisitionService } from "@mdl/hrm/client/services/JobRequisitionService";
import {
  useCreateUpdate,
  useSetBreadcrumbs,
} from "@base/client/hooks";
import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";

import JobRequisitionForm, {
  type JobRequisitionFormValues,
} from "./components/JobRequisitionForm/JobRequisitionForm";

const JOB_REQUISITIONS_LIST_PATH = "/workspace/modules/hrm/job-requisitions";

export default function JobRequisitionEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.jobRequisitions");
  const tCommon = useTranslations("common");

  const {
    data: jobRequisitionData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-job-requisitions", id],
    queryFn: async () => {
      const response = await jobRequisitionService.getById(id);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToLoadJobRequisition"),
        );
      }

      return response.data;
    },
    enabled: !!id,
  });

  const viewPath = `${JOB_REQUISITIONS_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () =>
      jobRequisitionData
        ? [
            { label: t("title"), href: JOB_REQUISITIONS_LIST_PATH },
            {
              label:
                jobRequisitionData.requisitionNumber ||
                t("edit"),
              href: viewPath,
            },
            { label: t("edit") },
          ]
        : [
            { label: t("title"), href: JOB_REQUISITIONS_LIST_PATH },
            { label: t("edit") },
          ],
    [t, jobRequisitionData, viewPath],
  );

  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: submitJobRequisition,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof jobRequisitionService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await jobRequisitionService.update(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToUpdateJobRequisition"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-job-requisitions"], ["hrm-job-requisitions", id]],
    onSuccess: (data) => {
      router.push(`${JOB_REQUISITIONS_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: JobRequisitionFormValues) => {
    await submitJobRequisition({
      id,
      requisitionNumber: String(values.requisitionNumber).trim(),
      title:
        values.title &&
        typeof values.title === "object" &&
        !Array.isArray(values.title) &&
        ("vi" in values.title || "en" in values.title)
          ? (values.title as { vi?: string; en?: string })
          : undefined,
      description:
        values.description &&
        typeof values.description === "object" &&
        !Array.isArray(values.description) &&
        (values.description === null ||
          "vi" in values.description ||
          "en" in values.description)
          ? (values.description as { vi?: string; en?: string } | null)
          : null,
      departmentId:
        typeof values.departmentId === "string"
          ? values.departmentId.trim()
          : undefined,
      positionId:
        typeof values.positionId === "string"
          ? values.positionId.trim()
          : undefined,
      numberOfOpenings:
        typeof values.numberOfOpenings === "number"
          ? values.numberOfOpenings
          : undefined,
      priority:
        typeof values.priority === "string" ? values.priority : undefined,
      employmentType:
        typeof values.employmentType === "string"
          ? values.employmentType
          : null,
      minSalary: typeof values.minSalary === "number" ? values.minSalary : null,
      maxSalary: typeof values.maxSalary === "number" ? values.maxSalary : null,
      currency:
        typeof values.currency === "string" ? values.currency : undefined,
      requirements:
        typeof values.requirements === "string"
          ? values.requirements.trim()
          : null,
      status: typeof values.status === "string" ? values.status : undefined,
      openedDate:
        typeof values.openedDate === "string" ? values.openedDate.trim() : null,
      closedDate:
        typeof values.closedDate === "string" ? values.closedDate.trim() : null,
      hiringManagerId:
        typeof values.hiringManagerId === "string"
          ? values.hiringManagerId.trim()
          : null,
      recruiterId:
        typeof values.recruiterId === "string"
          ? values.recruiterId.trim()
          : null,
      notes: typeof values.notes === "string" ? values.notes.trim() : null,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isError || !jobRequisitionData) {
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

  return (
    <IBasePageLayout
      maxWidth="form"
      subtitle={jobRequisitionData.requisitionNumber}
      title={t("edit")}
      variant="edit"
    >
      <JobRequisitionForm
        defaultValues={{
          requisitionNumber: jobRequisitionData.requisitionNumber,
          title: (jobRequisitionData.title as any) || { vi: "", en: "" },
          description: jobRequisitionData.description as any,
          departmentId: jobRequisitionData.departmentId,
          positionId: jobRequisitionData.positionId,
          numberOfOpenings: jobRequisitionData.numberOfOpenings,
          priority: jobRequisitionData.priority || "normal",
          employmentType: jobRequisitionData.employmentType || "",
          minSalary: jobRequisitionData.minSalary || undefined,
          maxSalary: jobRequisitionData.maxSalary || undefined,
          currency: jobRequisitionData.currency || "VND",
          requirements: jobRequisitionData.requirements || "",
          status: jobRequisitionData.status,
          openedDate: jobRequisitionData.openedDate || "",
          closedDate: jobRequisitionData.closedDate || "",
          hiringManagerId: jobRequisitionData.hiringManagerId || "",
          recruiterId: jobRequisitionData.recruiterId || "",
          notes: jobRequisitionData.notes || "",
        }}
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
