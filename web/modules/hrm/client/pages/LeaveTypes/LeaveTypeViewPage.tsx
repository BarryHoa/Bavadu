"use client";

import { Pencil } from "lucide-react";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import { leaveTypeService } from "@mdl/hrm/client/services/LeaveTypeService";
import { useLocalizedText, useSetBreadcrumbs } from "@base/client/hooks";
import { IBaseDigitViewer } from "@base/client/components";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBasePageLayout,
  IBaseSpinner,
} from "@base/client";

const LEAVE_TYPES_LIST_PATH = "/workspace/modules/hrm/leave-types";

export default function LeaveTypeViewPage(): React.ReactNode {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const t = useTranslations("hrm.leaveTypes");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  const {
    data: leaveTypeData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["hrm-leave-types", id],
    queryFn: async () => {
      const response = await leaveTypeService.getById(id);

      if (!response.data) {
        throw new Error(response.message ?? t("errors.failedToLoadLeaveType"));
      }

      return response.data;
    },
    enabled: !!id,
  });

  const breadcrumbs = useMemo(
    () =>
      leaveTypeData
        ? [
            { label: t("title"), href: LEAVE_TYPES_LIST_PATH },
            {
              label:
                getLocalizedText(leaveTypeData.name) || leaveTypeData.code,
              href: `${LEAVE_TYPES_LIST_PATH}/view/${id}`,
            },
          ]
        : [
            { label: t("title"), href: LEAVE_TYPES_LIST_PATH },
            { label: isLoading ? "..." : "Leave Type" },
          ],
    [t, leaveTypeData, id, isLoading, getLocalizedText],
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

  if (isError || !leaveTypeData) {
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

  const title = getLocalizedText(leaveTypeData.name) || leaveTypeData.code;
  const editPath = `${LEAVE_TYPES_LIST_PATH}/edit/${id}`;

  return (
    <IBasePageLayout
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
      maxWidth="content"
      subtitle={leaveTypeData.code}
      title={title}
      variant="detail"
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
              label={t("labels.code")}
              value={leaveTypeData.code}
            />
            <IBaseDigitViewer
              label={t("labels.name")}
              value={getLocalizedText(leaveTypeData.name)}
            />
            <IBaseDigitViewer
              label={t("labels.accrualType")}
              value={leaveTypeData.accrualType}
            />
            <IBaseDigitViewer
              label={t("labels.accrualRate")}
              value={
                leaveTypeData.accrualRate
                  ? `${leaveTypeData.accrualRate} days`
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.maxAccrual")}
              value={
                leaveTypeData.maxAccrual
                  ? `${leaveTypeData.maxAccrual} days`
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.carryForward")}
              value={
                leaveTypeData.carryForward ? tCommon("yes") : tCommon("no")
              }
            />
            <IBaseDigitViewer
              label={t("labels.maxCarryForward")}
              value={
                leaveTypeData.maxCarryForward
                  ? `${leaveTypeData.maxCarryForward} days`
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.requiresApproval")}
              value={
                leaveTypeData.requiresApproval ? tCommon("yes") : tCommon("no")
              }
            />
            <IBaseDigitViewer
              label={t("labels.isPaid")}
              value={leaveTypeData.isPaid ? tCommon("yes") : tCommon("no")}
            />
            <IBaseDigitViewer
              label={t("labels.isActive")}
              value={
                leaveTypeData.isActive ? tCommon("active") : tCommon("inactive")
              }
            />
          </div>
        </IBaseCardBody>
      </IBaseCard>
    </IBasePageLayout>
  );
}
