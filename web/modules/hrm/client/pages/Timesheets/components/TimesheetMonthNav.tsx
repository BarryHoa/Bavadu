"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

import { IBaseButton } from "@base/client/components";

interface TimesheetMonthNavProps {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onCurrent: () => void;
  isNextDisabled: boolean;
}

export function TimesheetMonthNav({
  monthLabel,
  onPrev,
  onNext,
  onCurrent,
  isNextDisabled,
}: TimesheetMonthNavProps): React.ReactNode {
  const t = useTranslations("hrm.timesheets");

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h1 className="text-xl font-semibold">
        {t("monthly")} – {monthLabel}
      </h1>
      <div className="flex items-center gap-2">
        <IBaseButton
          size="sm"
          startContent={<ChevronLeft className="size-4" />}
          variant="bordered"
          onPress={onPrev}
        >
          {t("prevMonth")}
        </IBaseButton>
        <IBaseButton
          color="primary"
          size="sm"
          startContent={<Calendar className="size-4" />}
          variant="flat"
          onPress={onCurrent}
        >
          {t("currentMonth")}
        </IBaseButton>
        <IBaseButton
          endContent={<ChevronRight className="size-4" />}
          isDisabled={isNextDisabled}
          size="sm"
          variant="bordered"
          onPress={onNext}
        >
          {t("nextMonth")}
        </IBaseButton>
      </div>
    </div>
  );
}
