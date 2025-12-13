"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { jobRequisitionService } from "@mdl/hrm/client/services/JobRequisitionService";
import JobRequisitionForm, {
  type JobRequisitionFormValues,
} from "./components/JobRequisitionForm/JobRequisitionForm";
import { LoadingOverlay } from "@base/client/components";

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
  } = useQuery({
    queryKey: ["hrm-job-requisitions", id],
    queryFn: async () => {
      const response = await jobRequisitionService.getById(id);
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToLoadJobRequisition"));
      }
      return response.data;
    },
    enabled: !!id,
  });

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
        throw new Error(response.message ?? t("errors.failedToUpdateJobRequisition"));
      }
      return response.data;
    },
    invalidateQueries: [["hrm-job-requisitions"], ["hrm-job-requisitions", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/job-requisitions/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: JobRequisitionFormValues) => {
    await submitJobRequisition({
      id,
      requisitionNumber: values.requisitionNumber.trim(),
      title: values.title || { vi: "", en: "" },
      description: values.description || null,
      departmentId: values.departmentId.trim(),
      positionId: values.positionId.trim(),
      numberOfOpenings: values.numberOfOpenings || 1,
      priority: values.priority || "normal",
      employmentType: values.employmentType || null,
      minSalary: values.minSalary || null,
      maxSalary: values.maxSalary || null,
      currency: values.currency || "VND",
      requirements: values.requirements?.trim() || null,
      status: values.status || "draft",
      openedDate: values.openedDate?.trim() || null,
      closedDate: values.closedDate?.trim() || null,
      hiringManagerId: values.hiringManagerId?.trim() || null,
      recruiterId: values.recruiterId?.trim() || null,
      notes: values.notes?.trim() || null,
    });
  };

  if (isLoading) {
    return <LoadingOverlay />;
  }

  if (isError) {
    return (
      <div className="text-danger-500">
        {tCommon("errors.failedToLoadData")}: {error?.message}
      </div>
    );
  }

  if (!jobRequisitionData) {
    return (
      <div className="text-warning-500">{tCommon("errors.dataNotFound")}</div>
    );
  }

  return (
    <JobRequisitionForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/job-requisitions/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
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
    />
  );
}

