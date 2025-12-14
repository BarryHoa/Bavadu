"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { jobRequisitionService } from "@mdl/hrm/client/services/JobRequisitionService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
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
        throw new Error(
          response.message ?? t("errors.failedToCreateJobRequisition")
        );
      }
      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-job-requisitions"]],
    onSuccess: (data) => {
      router.push(
        `/workspace/modules/hrm/job-requisitions/view/${data.data.id}`
      );
    },
  });

  const handleSubmit = async (values: JobRequisitionFormValues) => {
    await submitJobRequisition({
      requisitionNumber: String(values.requisitionNumber).trim(),
      title:
        values.title &&
        typeof values.title === "object" &&
        !Array.isArray(values.title) &&
        ("vi" in values.title || "en" in values.title)
          ? (values.title as { vi?: string; en?: string })
          : { vi: "", en: "" },
      description:
        values.description &&
        typeof values.description === "object" &&
        !Array.isArray(values.description) &&
        (values.description === null ||
          "vi" in values.description ||
          "en" in values.description)
          ? (values.description as { vi?: string; en?: string } | null)
          : null,
      departmentId: String(values.departmentId).trim(),
      positionId: String(values.positionId).trim(),
      numberOfOpenings:
        typeof values.numberOfOpenings === "number"
          ? values.numberOfOpenings
          : 1,
      priority:
        typeof values.priority === "string" ? values.priority : "normal",
      employmentType:
        typeof values.employmentType === "string"
          ? values.employmentType
          : null,
      minSalary: typeof values.minSalary === "number" ? values.minSalary : null,
      maxSalary: typeof values.maxSalary === "number" ? values.maxSalary : null,
      currency: typeof values.currency === "string" ? values.currency : "VND",
      requirements:
        typeof values.requirements === "string"
          ? values.requirements.trim()
          : null,
      status: typeof values.status === "string" ? values.status : "draft",
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

  return (
    <JobRequisitionForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/workspace/modules/hrm/job-requisitions")}
      submitError={submitError}
      isSubmitting={isPending}
    />
  );
}
