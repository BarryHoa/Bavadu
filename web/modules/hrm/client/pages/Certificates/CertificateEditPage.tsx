"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

import { certificateService } from "@mdl/hrm/client/services/CertificateService";
import { useCreateUpdate, useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { IBaseButton, IBasePageLayout, IBaseSpinner } from "@base/client";

import CertificateForm, {
  type CertificateFormValues,
} from "./components/CertificateForm/CertificateForm";

const CERTIFICATES_LIST_PATH = "/workspace/modules/hrm/certificates";

export default function CertificateEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.certificates");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: certificateData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-certificates", id],
    queryFn: async () => {
      const response = await certificateService.getById(id);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToLoadCertificate"),
        );
      }

      return response.data;
    },
    enabled: !!id,
  });

  const {
    handleSubmit: submitCertificate,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof certificateService.update>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await certificateService.update(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToUpdateCertificate"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-certificates"], ["hrm-certificates", id]],
    onSuccess: (data) => {
      router.push(`${CERTIFICATES_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const viewPath = `${CERTIFICATES_LIST_PATH}/view/${id}`;
  const breadcrumbs = useMemo(
    () =>
      certificateData
        ? [
            { label: t("title"), href: CERTIFICATES_LIST_PATH },
            {
              label:
                getLocalizedText(certificateData.name as any) ||
                certificateData.certificateNumber ||
                certificateData.issuer ||
                t("edit"),
              href: viewPath,
            },
            { label: t("edit") },
          ]
        : [
            { label: t("title"), href: CERTIFICATES_LIST_PATH },
            { label: t("edit") },
          ],
    [t, certificateData, viewPath, getLocalizedText],
  );

  useSetBreadcrumbs(breadcrumbs);

  const handleSubmit = async (values: CertificateFormValues) => {
    await submitCertificate({
      id,
      employeeId: values.employeeId.trim(),
      name: values.name || { vi: "", en: "" },
      issuer: values.issuer.trim(),
      certificateNumber: values.certificateNumber?.trim() || null,
      issueDate: values.issueDate.trim(),
      expiryDate: values.expiryDate?.trim() || null,
      documentUrl: values.documentUrl?.trim() || null,
      isActive: values.isActive === "true",
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

  if (isError || !certificateData) {
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

  const subtitle = [certificateData.certificateNumber, certificateData.issuer].filter(Boolean).join(" · ");

  return (
    <IBasePageLayout
      maxWidth="form"
      subtitle={subtitle || undefined}
      title={t("edit")}
      variant="edit"
    >
      <CertificateForm
      defaultValues={{
        employeeId: certificateData.employeeId,
        name: (certificateData.name as any) || { vi: "", en: "" },
        issuer: certificateData.issuer,
        certificateNumber: certificateData.certificateNumber || "",
        issueDate: certificateData.issueDate,
        expiryDate: certificateData.expiryDate || "",
        documentUrl: certificateData.documentUrl || "",
        isActive: certificateData.isActive ? "true" : "false",
      }}
      isSubmitting={isPending}
      submitError={submitError}
      onCancel={() => router.push(viewPath)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
