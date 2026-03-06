"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { IBaseButton } from "@base/client/components";

export type TimesheetViewMode = "grid" | "list";

interface TimesheetMonthNavProps {
  monthLabel: string;
  onPrev: () => void;
  onNext: () => void;
  onCurrent: () => void;
  isNextDisabled: boolean;
  viewMode: TimesheetViewMode;
  onViewModeChange: (mode: TimesheetViewMode) => void;
}

export function TimesheetMonthNav({
  monthLabel,
  onPrev,
  onNext,
  onCurrent,
  isNextDisabled,
  viewMode,
  onViewModeChange,
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
        <span className="mx-1 h-5 w-px bg-default-200" aria-hidden />
        <IBaseButton
          size="sm"
          variant="bordered"
          isIconOnly
          aria-label={t("viewGrid")}
          title={t("viewGrid")}
          className={viewMode === "grid" ? "bg-primary-100 text-primary-700" : ""}
          onPress={() => onViewModeChange("grid")}
        >
          <LayoutGrid className="size-4" />
        </IBaseButton>
        <IBaseButton
          size="sm"
          variant="bordered"
          isIconOnly
          aria-label={t("viewList")}
          title={t("viewList")}
          className={viewMode === "list" ? "bg-primary-100 text-primary-700" : ""}
          onPress={() => onViewModeChange("list")}
        >
          <List className="size-4" />
        </IBaseButton>
      </div>
    </div>
  );
}
