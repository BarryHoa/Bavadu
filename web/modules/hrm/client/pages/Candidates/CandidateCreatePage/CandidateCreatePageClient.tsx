"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { candidateService } from "@mdl/hrm/client/services/CandidateService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import CandidateForm, {
  type CandidateFormValues,
} from "../components/CandidateForm/CandidateForm";

export default function CandidateCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.candidates");

  const {
    handleSubmit: submitCandidate,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof candidateService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await candidateService.create(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToCreateCandidate"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-candidates"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/candidates/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: CandidateFormValues) => {
    await submitCandidate({
      requisitionId: values.requisitionId.trim(),
      firstName: values.firstName?.trim() || null,
      lastName: values.lastName?.trim() || null,
      fullName: values.fullName || { vi: "", en: "" },
      email: values.email?.trim() || null,
      phone: values.phone?.trim() || null,
      dateOfBirth: values.dateOfBirth?.trim() || null,
      gender: values.gender?.trim() || null,
      address: values.address || null,
      cvUrl: values.cvUrl?.trim() || null,
      coverLetter: values.coverLetter?.trim() || null,
      source: values.source?.trim() || null,
      status: values.status || "applied",
      stage: values.stage?.trim() || null,
      rating: values.rating || null,
      notes: values.notes?.trim() || null,
    });
  };

  return (
    <CandidateForm
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push("/workspace/modules/hrm/candidates")}
      onSubmit={handleSubmit}
    />
  );
}
