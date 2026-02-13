"use client";

import { IBasePageLayout } from "@base/client";
import { useCreateUpdate, useSetBreadcrumbs } from "@base/client/hooks";
import { certificateService } from "@mdl/hrm/client/services/CertificateService";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

import CertificateForm, {
  type CertificateFormValues,
} from "../components/CertificateForm/CertificateForm";

const CERTIFICATES_LIST_PATH = "/workspace/modules/hrm/certificates";

export default function CertificateCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.certificates");

  const breadcrumbs = useMemo(
    () => [
      { label: t("title"), href: CERTIFICATES_LIST_PATH },
      { label: t("create") },
    ],
    [t],
  );
  useSetBreadcrumbs(breadcrumbs);

  const {
    handleSubmit: submitCertificate,
    error: submitError,
    isPending,
  } = useCreateUpdate<
    Parameters<typeof certificateService.create>[0],
    { data: { id: string } }
  >({
    mutationFn: async (payload) => {
      const response = await certificateService.create(payload);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToCreateCertificate"),
        );
      }

      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-certificates"]],
    onSuccess: (data) => {
      router.push(`${CERTIFICATES_LIST_PATH}/view/${data.data.id}`);
    },
  });

  const handleSubmit = async (values: CertificateFormValues) => {
    await submitCertificate({
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

  return (
    <IBasePageLayout
      variant="create"
      maxWidth="form"
      title={t("create")}
    >
      <CertificateForm
        isSubmitting={isPending}
        submitError={submitError}
        onCancel={() => router.push(CERTIFICATES_LIST_PATH)}
        onSubmit={handleSubmit}
      />
    </IBasePageLayout>
  );
}
