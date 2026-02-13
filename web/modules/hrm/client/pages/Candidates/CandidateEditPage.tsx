"use client";

import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";
import { useCreateUpdate, useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { candidateService } from "@mdl/hrm/client/services/CandidateService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import CandidateForm, {
  type CandidateFormValues,
} from "./components/CandidateForm/CandidateForm";

const CANDIDATES_LIST_PATH = "/workspace/modules/hrm/candidates";

export default function CandidateEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.candidates");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: candidateData,
    isLoading,
    isError,
    error,
    refetch,
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
      router.push(`${CANDIDATES_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const viewPath = `${CANDIDATES_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () =>
      candidateData
        ? [
            { label: t("title"), href: CANDIDATES_LIST_PATH },
            {
              label:
                getLocalizedText(candidateData.fullName as any) ||
                candidateData.email ||
                candidateData.phone ||
                t("edit"),
              href: viewPath,
            },
            { label: t("edit") },
          ]
        : [
            { label: t("title"), href: CANDIDATES_LIST_PATH },
            { label: t("edit") },
          ],
    [t, candidateData, viewPath, getLocalizedText],
  );
  useSetBreadcrumbs(breadcrumbs);

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
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>{tCommon("loading")}</span>
      </div>
    );
  }

  if (isError || !candidateData) {
    return (
      <div className="flex flex-col gap-4 rounded-xl border-2 border-danger-200 bg-danger-50/50 p-6">
        <p className="font-medium text-danger-700">
          {error instanceof Error ? error.message : tCommon("errors.dataNotFound")}
        </p>
        <IBaseButton
          size="sm"
          variant="bordered"
          color="danger"
          onPress={() => refetch()}
        >
          Retry
        </IBaseButton>
      </div>
    );
  }

  const subtitle = [candidateData.email, candidateData.status].filter(Boolean).join(" · ");

  return (
    <IBasePageLayout
      variant="edit"
      maxWidth="form"
      title={t("edit")}
      subtitle={subtitle || undefined}
    >
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
      onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
