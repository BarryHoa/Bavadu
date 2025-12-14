"use client";

import { useCreateUpdate } from "@base/client/hooks/useCreateUpdate";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { certificateService } from "@mdl/hrm/client/services/CertificateService";
import CertificateForm, {
  type CertificateFormValues,
} from "./components/CertificateForm/CertificateForm";
import { LoadingOverlay } from "@base/client/components";

export default function CertificateEditPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.certificates");
  const tCommon = useTranslations("common");

  const {
    data: certificateData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["hrm-certificates", id],
    queryFn: async () => {
      const response = await certificateService.getById(id);
      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToLoadCertificate"));
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
        throw new Error(response.message ?? t("errors.failedToUpdateCertificate"));
      }
      return { data: { id: response.data.id } };
    },
    invalidateQueries: [["hrm-certificates"], ["hrm-certificates", id]],
    onSuccess: (data) => {
      router.push(`/workspace/modules/hrm/certificates/view/${data.data.id}`);
    },
  });

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
    return <LoadingOverlay isLoading={true} />;
  }

  if (isError) {
    return (
      <div className="text-danger-500">
        {tCommon("errors.failedToLoadData")}: {error?.message}
      </div>
    );
  }

  if (!certificateData) {
    return (
      <div className="text-warning-500">{tCommon("errors.dataNotFound")}</div>
    );
  }

  return (
    <CertificateForm
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/workspace/modules/hrm/certificates/view/${id}`)}
      submitError={submitError}
      isSubmitting={isPending}
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
    />
  );
}

