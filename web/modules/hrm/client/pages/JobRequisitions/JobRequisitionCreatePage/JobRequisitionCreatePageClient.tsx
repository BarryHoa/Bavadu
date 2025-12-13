"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { jobRequisitionService } from "@mdl/hrm/client/services/JobRequisitionService";
import JobRequisitionForm, {
  type JobRequisitionFormValues,
} from "../components/JobRequisitionForm/JobRequisitionForm";

export default function JobRequisitionCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.jobRequisitions");

  const {
    handleSubmit: submitJobRequisition,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof jobRequisitionService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await jobRequisitionService.create(payload);
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToCreateJobRequisition"));
      }
      return response.data;
    },
    invalidateQueries: [["hrm-job-requisitions"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/job-requisitions/view/${data.id}`);
    },
  });

  const handleSubmit = async (values: JobRequisitionFormValues) => {
    await submitJobRequisition({
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

  return (
    <JobRequisitionForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/workspace/modules/hrm/job-requisitions")}
      submitError={submitError}
      isSubmitting={isPending}
    />
  );
}

