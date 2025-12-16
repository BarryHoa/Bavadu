"use client";

import { LoadingOverlay } from "@base/client/components";
import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { candidateService } from "@mdl/hrm/client/services/CandidateService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

import CandidateForm, {
  type CandidateFormValues,
} from "./components/CandidateForm/CandidateForm";

export default function CandidateEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.candidates");
  const tCommon = useTranslations("common");

  const {
    data: candidateData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["hrm-candidates", id],
    queryFn: async () => {
      const response = await candidateService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToLoadCandidate"));
      }

      return response.data;
    },
    enabled: !!id,
  });

  const {
    handleSubmit: submitCandidate,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof candidateService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await candidateService.update(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToUpdateCandidate"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-candidates"], ["hrm-candidates", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/candidates/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: CandidateFormValues) => {
    await submitCandidate({
      id,
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

  if (!candidateData) {
    return (
      <div className="text-warning-500">{tCommon("errors.dataNotFound")}</div>
    );
  }

  return (
    <CandidateForm
      defaultValues={{
        requisitionId: candidateData.requisitionId,
        firstName: candidateData.firstName || "",
        lastName: candidateData.lastName || "",
        fullName: (candidateData.fullName as any) || { vi: "", en: "" },
        email: candidateData.email || "",
        phone: candidateData.phone || "",
        dateOfBirth: candidateData.dateOfBirth || "",
        gender: candidateData.gender || "",
        address: candidateData.address as any,
        cvUrl: candidateData.cvUrl || "",
        coverLetter: candidateData.coverLetter || "",
        source: candidateData.source || "",
        status: candidateData.status,
        stage: candidateData.stage || "",
        rating: candidateData.rating || undefined,
        notes: candidateData.notes || "",
      }}
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() =>
        router.push(`/workspace/modules/hrm/candidates/view/${id}`)
      }
      onSubmit={handleSubmit}
    />
  );
}
