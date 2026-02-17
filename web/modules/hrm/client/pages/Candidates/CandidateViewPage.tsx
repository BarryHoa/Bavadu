"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

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
import { candidateService } from "@mdl/hrm/client/services/CandidateService";

const CANDIDATES_LIST_PATH = "/workspace/modules/hrm/candidates";

export default function CandidateViewPage(): React.ReactNode {
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
                t("generalInfo"),
            },
          ]
        : [
            { label: t("title"), href: CANDIDATES_LIST_PATH },
            { label: isLoading ? "..." : tCommon("errors.dataNotFound") },
          ],
    [t, candidateData, isLoading, tCommon, getLocalizedText],
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

  if (isError || !candidateData) {
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

  const titleLabel =
    getLocalizedText(candidateData.fullName as any) ||
    candidateData.email ||
    candidateData.phone ||
    t("generalInfo");
  const subtitle = [candidateData.status, candidateData.stage].filter(Boolean).join(" · ");
  const editPath = `${CANDIDATES_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
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
      maxWidth="content"
      subtitle={subtitle || undefined}
      title={titleLabel}
      variant="detail"
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-6 p-6">
          <h2 className="text-lg font-semibold text-foreground">{t("generalInfo")}</h2>
          <div className="grid gap-2 md:grid-cols-2">
            <IBaseDigitViewer
              label={t("labels.fullName")}
              value={getLocalizedText(candidateData.fullName)}
            />
            <IBaseDigitViewer
              label={t("labels.firstName")}
              value={candidateData.firstName}
            />
            <IBaseDigitViewer
              label={t("labels.lastName")}
              value={candidateData.lastName}
            />
            <IBaseDigitViewer
              label={t("labels.email")}
              value={candidateData.email}
            />
            <IBaseDigitViewer
              label={t("labels.phone")}
              value={candidateData.phone}
            />
            <IBaseDigitViewer
              label={t("labels.dateOfBirth")}
              value={formatDate(candidateData.dateOfBirth)}
            />
            <IBaseDigitViewer
              label={t("labels.gender")}
              value={candidateData.gender}
            />
            <IBaseDigitViewer
              label={t("labels.requisition")}
              value={candidateData.requisition?.requisitionNumber || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.status")}
              value={candidateData.status}
            />
            <IBaseDigitViewer
              label={t("labels.stage")}
              value={candidateData.stage || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.rating")}
              value={candidateData.rating ? `${candidateData.rating}/5` : "—"}
            />
            <IBaseDigitViewer
              label={t("labels.source")}
              value={candidateData.source || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.cvUrl")}
              value={candidateData.cvUrl || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.appliedDate")}
              value={formatDate(candidateData.appliedDate)}
            />
            <div className="md:col-span-2">
              <IBaseDigitViewer
                label={t("labels.coverLetter")}
                value={candidateData.coverLetter || "—"}
              />
            </div>
            <div className="md:col-span-2">
              <IBaseDigitViewer
                label={t("labels.notes")}
                value={candidateData.notes || "—"}
              />
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
