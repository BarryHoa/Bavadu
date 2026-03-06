"use client";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

import { useTranslations } from "next-intl";

import {
  IBaseDigitViewer,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalHeader,
} from "@base/client/components";
import { formatDate, formatDateWithTime } from "@base/client/utils/date/formatDate";

interface TimesheetDetailModalProps {
  timesheet: TimesheetDto | null;
  onClose: () => void;
}

export function TimesheetDetailModal({
  timesheet,
  onClose,
}: TimesheetDetailModalProps): React.ReactNode {
  const t = useTranslations("hrm.timesheets");

  if (!timesheet) return null;

  return (
    <IBaseModal isOpen={!!timesheet} size="md" onOpenChange={(open) => !open && onClose()}>
      <IBaseModalContent>
        <IBaseModalHeader>
          {formatDate(timesheet.workDate)}
        </IBaseModalHeader>
        <IBaseModalBody>
          <div className="space-y-4">
            <div className="grid gap-4 grid-cols-3">
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
            </div>
            <IBaseDigitViewer
              label={t("labels.notes")}
              value={timesheet.notes || "—"}
            />
          </div>
        </IBaseModalBody>
      </IBaseModalContent>
    </IBaseModal>
  );
}
