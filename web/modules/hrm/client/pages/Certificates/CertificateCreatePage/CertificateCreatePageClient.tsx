"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { certificateService } from "@mdl/hrm/client/services/CertificateService";
import CertificateForm, {
  type CertificateFormValues,
} from "../components/CertificateForm/CertificateForm";

export default function CertificateCreatePageClient(): React.ReactNode {
  const router = useRouter();
  const t = useTranslations("hrm.certificates");

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
        throw new Error(response.message ?? t("errors.failedToCreateCertificate"));
      }
      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-certificates"]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/certificates/view/${data.data.id}`);
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
    <CertificateForm
      onSubmit={handleSubmit}
      onCancel={() => router.push("/workspace/modules/hrm/certificates")}
      submitError={submitError}
      isSubmitting={isPending}
    />
  );
}

