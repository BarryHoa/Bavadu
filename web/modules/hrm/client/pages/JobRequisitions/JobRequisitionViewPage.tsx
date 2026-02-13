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
import { jobRequisitionService } from "@mdl/hrm/client/services/JobRequisitionService";
import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

const JOB_REQUISITIONS_LIST_PATH = "/workspace/modules/hrm/job-requisitions";

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
    refetch,
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

  const breadcrumbs = useMemo(
    () =>
      jobRequisitionData
        ? [
            { label: t("title"), href: JOB_REQUISITIONS_LIST_PATH },
            {
              label:
                getLocalizedText(jobRequisitionData.title) ||
                jobRequisitionData.requisitionNumber,
              href: `${JOB_REQUISITIONS_LIST_PATH}/view/${id}`,
            },
          ]
        : [
            { label: t("title"), href: JOB_REQUISITIONS_LIST_PATH },
            { label: isLoading ? "..." : "Job Requisition" },
          ],
    [t, jobRequisitionData, id, isLoading, getLocalizedText],
  );
  useSetBreadcrumbs(breadcrumbs);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-default-500">
        <IBaseSpinner size="md" />
        <span>Loading...</span>
      </div>
    );
  }

  if (isError || !jobRequisitionData) {
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

  const title =
    getLocalizedText(jobRequisitionData.title) ||
    jobRequisitionData.requisitionNumber;
  const editPath = `${JOB_REQUISITIONS_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
      variant="detail"
      maxWidth="content"
      title={title}
      subtitle={jobRequisitionData.requisitionNumber}
      headerActions={
        <IBaseButton
          color="primary"
          size="md"
          startContent={<Pencil size={16} />}
          onPress={() => router.push(editPath)}
        >
          {tCommon("actions.edit")}
        </IBaseButton>
      }
    >
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="gap-6 p-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("generalInfo")}
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
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
            <div className="sm:col-span-2">
              <IBaseDigitViewer
                label={t("labels.requirements")}
                value={jobRequisitionData.requirements || "—"}
              />
            </div>
            <div className="sm:col-span-2">
              <IBaseDigitViewer
                label={t("labels.notes")}
                value={jobRequisitionData.notes || "—"}
              />
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
