"use client";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseDigitViewer,
  LoadingOverlay,
} from "@base/client/components";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { certificateService } from "@mdl/hrm/client/services/CertificateService";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";

export default function CertificateViewPage(): React.ReactNode {
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
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex justify-end gap-3 py-2 mb-3 bg-background border-b border-divider -mx-4 px-4">
        <IBaseButton
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/hrm/certificates")}
        >
          {tCommon("actions.backToList")}
        </IBaseButton>
        <IBaseButton
          color="primary"
          size="sm"
          onPress={() =>
            router.push(`/workspace/modules/hrm/certificates/edit/${id}`)
          }
        >
          {tCommon("actions.edit")}
        </IBaseButton>
      </div>

      <IBaseCard>
        <IBaseCardBody className="p-4">
          <h2 className="text-base font-semibold mb-2">{t("generalInfo")}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <IBaseDigitViewer
              label={t("labels.employee")}
              value={
                getLocalizedText(certificateData.employee?.fullName) ||
                certificateData.employee?.employeeCode
              }
            />
            <IBaseDigitViewer
              label={t("labels.name")}
              value={getLocalizedText(certificateData.name)}
            />
            <IBaseDigitViewer
              label={t("labels.issuer")}
              value={certificateData.issuer}
            />
            <IBaseDigitViewer
              label={t("labels.certificateNumber")}
              value={certificateData.certificateNumber || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.issueDate")}
              value={formatDate(certificateData.issueDate)}
            />
            <IBaseDigitViewer
              label={t("labels.expiryDate")}
              value={formatDate(certificateData.expiryDate)}
            />
            <IBaseDigitViewer
              label={t("labels.documentUrl")}
              value={certificateData.documentUrl || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.isActive")}
              value={
                certificateData.isActive
                  ? tCommon("active")
                  : tCommon("inactive")
              }
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
