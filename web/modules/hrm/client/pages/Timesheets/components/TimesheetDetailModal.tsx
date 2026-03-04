"use client";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

import { useTranslations } from "next-intl";

import {
  IBaseButton,
  IBaseDigitViewer,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import {
  formatDate,
  formatDateWithTime,
} from "@base/client/utils/date/formatDate";

interface TimesheetDetailModalProps {
  timesheet: TimesheetDto | null;
  onClose: () => void;
}

export function TimesheetDetailModal({
  timesheet,
  onClose,
}: TimesheetDetailModalProps): React.ReactNode {
  const t = useTranslations("hrm.timesheets");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();

  if (!timesheet) return null;

  return (
    <IBaseModal isOpen={!!timesheet} size="2xl" onOpenChange={(open) => !open && onClose()}>
      <IBaseModalContent>
        <IBaseModalHeader className="flex flex-col gap-1">
          <span>
            {getLocalizedText(timesheet.employee?.fullName) ||
              timesheet.employee?.employeeCode ||
              ""}
          </span>
          <span className="text-sm font-normal text-default-500">
            {formatDate(timesheet.workDate)}
          </span>
        </IBaseModalHeader>
        <IBaseModalBody>
          <div className="grid gap-2 md:grid-cols-2">
            <IBaseDigitViewer
              label={t("labels.employee")}
              value={
                getLocalizedText(timesheet.employee?.fullName) ||
                timesheet.employee?.employeeCode ||
                "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.workDate")}
              value={formatDate(timesheet.workDate)}
            />
            <IBaseDigitViewer
              label={t("labels.shift")}
              value={getLocalizedText(timesheet.shift?.name)}
            />
            <IBaseDigitViewer
              label={t("labels.checkInTime")}
              value={
                timesheet.checkInTime
                  ? formatDateWithTime(timesheet.checkInTime)
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.checkOutTime")}
              value={
                timesheet.checkOutTime
                  ? formatDateWithTime(timesheet.checkOutTime)
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.actualHours")}
              value={
                timesheet.actualHours != null
                  ? `${timesheet.actualHours}h`
                  : "—"
              }
            />
            <IBaseDigitViewer
              label={t("labels.status")}
              value={timesheet.status}
            />
            <IBaseDigitViewer
              label={t("labels.notes")}
              value={timesheet.notes || "—"}
            />
          </div>
        </IBaseModalBody>
        <IBaseModalFooter>
          <IBaseButton variant="bordered" onPress={onClose}>
            {tCommon("actions.close")}
          </IBaseButton>
        </IBaseModalFooter>
      </IBaseModalContent>
    </IBaseModal>
  );
}
