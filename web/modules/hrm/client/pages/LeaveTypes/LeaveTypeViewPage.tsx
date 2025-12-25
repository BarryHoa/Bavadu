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
import { leaveTypeService } from "@mdl/hrm/client/services/LeaveTypeService";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";

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

  if (!leaveTypeData) {
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
          onPress={() => router.push("/workspace/modules/hrm/leave-types")}
        >
          {tCommon("actions.backToList")}
        </IBaseButton>
        <IBaseButton
          color="primary"
          size="sm"
          onPress={() =>
            router.push(`/workspace/modules/hrm/leave-types/edit/${id}`)
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
    </div>
  );
}
