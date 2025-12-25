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
import { jobRequisitionService } from "@mdl/hrm/client/services/JobRequisitionService";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { formatDate } from "@base/client/utils/date/formatDate";

export default function JobRequisitionViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.jobRequisitions");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: jobRequisitionData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["hrm-job-requisitions", id],
    queryFn: async () => {
      const response = await jobRequisitionService.getById(id);

      if (!response.data) {
        throw new Error(
          response.message ?? t("errors.failedToLoadJobRequisition"),
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

  if (!jobRequisitionData) {
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
          onPress={() => router.push("/workspace/modules/hrm/job-requisitions")}
        >
          {tCommon("actions.backToList")}
        </IBaseButton>
        <IBaseButton
          color="primary"
          size="sm"
          onPress={() =>
            router.push(`/workspace/modules/hrm/job-requisitions/edit/${id}`)
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
              label={t("labels.requisitionNumber")}
              value={jobRequisitionData.requisitionNumber}
            />
            <IBaseDigitViewer
              label={t("labels.title")}
              value={getLocalizedText(jobRequisitionData.title)}
            />
            <IBaseDigitViewer
              label={t("labels.department")}
              value={getLocalizedText(jobRequisitionData.department?.name)}
            />
            <IBaseDigitViewer
              label={t("labels.position")}
              value={getLocalizedText(jobRequisitionData.position?.name)}
            />
            <IBaseDigitViewer
              label={t("labels.numberOfOpenings")}
              value={jobRequisitionData.numberOfOpenings.toString()}
            />
            <IBaseDigitViewer
              label={t("labels.priority")}
              value={jobRequisitionData.priority || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.status")}
              value={jobRequisitionData.status}
            />
            <IBaseDigitViewer
              label={t("labels.employmentType")}
              value={jobRequisitionData.employmentType || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.minSalary")}
              value={jobRequisitionData.minSalary?.toLocaleString() || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.maxSalary")}
              value={jobRequisitionData.maxSalary?.toLocaleString() || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.currency")}
              value={jobRequisitionData.currency || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.openedDate")}
              value={formatDate(jobRequisitionData.openedDate)}
            />
            <IBaseDigitViewer
              label={t("labels.closedDate")}
              value={formatDate(jobRequisitionData.closedDate)}
            />
            <IBaseDigitViewer
              label={t("labels.hiringManager")}
              value={jobRequisitionData.hiringManagerId || "—"}
            />
            <IBaseDigitViewer
              label={t("labels.recruiter")}
              value={jobRequisitionData.recruiterId || "—"}
            />
            <div className="md:col-span-2">
              <IBaseDigitViewer
                label={t("labels.requirements")}
                value={jobRequisitionData.requirements || "—"}
              />
            </div>
            <div className="md:col-span-2">
              <IBaseDigitViewer
                label={t("labels.notes")}
                value={jobRequisitionData.notes || "—"}
              />
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
