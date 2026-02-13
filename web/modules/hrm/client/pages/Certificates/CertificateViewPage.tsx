"use client";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";
import { IBaseDigitViewer } from "@base/client/components";
import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { formatDate } from "@base/client/utils/date/formatDate";
import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { certificateService } from "@mdl/hrm/client/services/CertificateService";

const CERTIFICATES_LIST_PATH = "/workspace/modules/hrm/certificates";

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
                t("generalInfo"),
            },
          ]
        : [
            { label: t("title"), href: CERTIFICATES_LIST_PATH },
            { label: isLoading ? "..." : tCommon("errors.dataNotFound") },
          ],
    [t, certificateData, isLoading, tCommon, getLocalizedText],
  );
  useSetBreadcrumbs(breadcrumbs);

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

  const titleLabel =
    getLocalizedText(certificateData.name as any) ||
    certificateData.certificateNumber ||
    certificateData.issuer ||
    t("generalInfo");
  const subtitle = [certificateData.issuer, certificateData.certificateNumber].filter(Boolean).join(" · ");
  const editPath = `${CERTIFICATES_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
      variant="detail"
      maxWidth="content"
      title={titleLabel}
      subtitle={subtitle || undefined}
      headerActions={
        <IBaseButton
          color="primary"
          size="sm"
          startContent={<Pencil className="size-4" />}
          onPress={() => router.push(editPath)}
        >
          {tCommon("actions.edit")}
        </IBaseButton>
      }
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-6 p-6">
          <h2 className="text-lg font-semibold text-foreground">{t("generalInfo")}</h2>
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
    </IBasePageLayout>
  );
}
