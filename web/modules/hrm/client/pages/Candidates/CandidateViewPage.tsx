"use client";

import { IBaseDigitViewer, LoadingOverlay } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/react";
import { candidateService } from "@mdl/hrm/client/services/CandidateService";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";

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
    <div className="space-y-4">
      <div className="sticky top-0 z-10 flex justify-end gap-3 py-2 mb-3 bg-background border-b border-divider -mx-4 px-4">
        <Button
          size="sm"
          variant="light"
          onPress={() => router.push("/workspace/modules/hrm/candidates")}
        >
          {tCommon("actions.backToList")}
        </Button>
        <Button
          color="primary"
          size="sm"
          onPress={() =>
            router.push(`/workspace/modules/hrm/candidates/edit/${id}`)
          }
        >
          {tCommon("actions.edit")}
        </Button>
      </div>

      <Card>
        <CardBody className="p-4">
          <h2 className="text-base font-semibold mb-2">{t("generalInfo")}</h2>
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
        </CardBody>
      </Card>
    </div>
  );
}

