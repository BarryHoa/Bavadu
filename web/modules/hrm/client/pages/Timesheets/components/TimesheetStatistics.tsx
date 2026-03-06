"use client";

import * as React from "react";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

import { IBaseCard, IBaseCardBody } from "@base/client/components";
import { useTranslations } from "next-intl";

/**
 * Count weekdays (Mon–Fri) in the given month, excluding holidays.
 * @param year - Year (e.g. 2024)
 * @param month - Month 1-12
 * @param holidays - Array of holiday dates (YYYY-MM-DD format)
 * @param workingDays - Array of weekday numbers (0=Sun, 1=Mon, ..., 6=Sat). Default: [1,2,3,4,5] (Mon-Fri)
 */
function getWorkingDaysInMonth(
  year: number,
  month: number,
  holidays: string[] = [],
  workingDays: number[] = [1, 2, 3, 4, 5],
): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  const holidaySet = new Set(holidays);
  let count = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dow = date.getDay();
    const dateStr = date.toISOString().split("T")[0];

    // Là ngày làm việc VÀ không phải ngày lễ
    if (workingDays.includes(dow) && !holidaySet.has(dateStr)) {
      count++;
    }
  }

  return count;
}

/** Count weekend days (Sat, Sun) in the given month. */
function getRestDaysInMonth(year: number, month: number): number {
  const daysInMonth = new Date(year, month, 0).getDate();
  let count = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dow = new Date(year, month - 1, day).getDay();

    if (dow === 0 || dow === 6) count++;
  }

  return count;
}

/** Count holiday days in the given month. */
function getHolidayDaysInMonth(
  year: number,
  month: number,
  holidays: string[],
): number {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const endDate = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return holidays.filter((h) => h >= startDate && h <= endDate).length;
}

function computeStats(
  timesheetList: TimesheetDto[],
  year: number,
  month: number,
  holidays: string[] = [],
): {
  workingDaysInMonth: number;
  totalWorkHours: number;
  totalWorkDays: number;
  totalLateHours: number;
  totalEarlyLeaveHours: number;
  totalOvertimeHours: number;
  restDaysInMonth: number;
  holidayDaysInMonth: number;
} {
  const workingDaysInMonth = getWorkingDaysInMonth(year, month, holidays);
  const restDaysInMonth = getRestDaysInMonth(year, month);
  const holidayDaysInMonth = getHolidayDaysInMonth(year, month, holidays);

  let totalWorkHours = 0;
  let totalWorkDays = 0;
  let totalLateHours = 0;
  let totalEarlyLeaveHours = 0;
  let totalOvertimeHours = 0;

  for (const ts of timesheetList) {
    if (ts.actualHours != null) {
      totalWorkHours += ts.actualHours;
    }

    totalWorkDays += 1;

    if (ts.overtimeHours != null && ts.overtimeHours > 0) {
      totalOvertimeHours += ts.overtimeHours;
    }
  }

  return {
    workingDaysInMonth,
    totalWorkHours,
    totalWorkDays,
    totalLateHours,
    totalEarlyLeaveHours,
    totalOvertimeHours,
    restDaysInMonth,
    holidayDaysInMonth,
  };
}

interface StatItemProps {
  label: string;
  value: string | number;
}

function StatItem({ label, value }: StatItemProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-default-500">{label}</span>
      <span className="text-sm font-semibold text-default-800">{value}</span>
    </div>
  );
}

interface TimesheetStatisticsProps {
  timesheetList: TimesheetDto[];
  year: number;
  month: number;
  /** Array of holiday dates (YYYY-MM-DD format) for the month */
  holidays?: string[];
  /** "default" = card above/below content; "sidebar" = compact vertical list for 30% sticky panel */
  variant?: "default" | "sidebar";
}

export function TimesheetStatistics({
  timesheetList,
  year,
  month,
  holidays = [],
  variant = "default",
}: TimesheetStatisticsProps): React.ReactElement {
  const t = useTranslations("hrm.timesheets.statistics");

  const stats = React.useMemo(
    () => computeStats(timesheetList, year, month, holidays),
    [timesheetList, year, month, holidays],
  );

  const formatHours = (h: number): string =>
    h === 0 ? "0h" : `${Number(h.toFixed(1))}h`;

  const items = [
    { label: t("workingDaysInMonth"), value: stats.workingDaysInMonth },
    { label: t("holidayDaysInMonth"), value: stats.holidayDaysInMonth },
    { label: t("totalWorkHours"), value: formatHours(stats.totalWorkHours) },
    { label: t("totalWorkDays"), value: stats.totalWorkDays },
    { label: t("totalLateHours"), value: formatHours(stats.totalLateHours) },
    {
      label: t("totalEarlyLeaveHours"),
      value: formatHours(stats.totalEarlyLeaveHours),
    },
    {
      label: t("totalOvertimeHours"),
      value: formatHours(stats.totalOvertimeHours),
    },
    { label: t("restDaysInMonth"), value: stats.restDaysInMonth },
  ];

  const content =
    variant === "sidebar" ? (
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <StatItem key={i} label={item.label} value={item.value} />
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
        {items.map((item, i) => (
          <StatItem key={i} label={item.label} value={item.value} />
        ))}
      </div>
    );

  if (variant === "sidebar") {
    return (
      <div className="sticky top-4 z-10 self-start rounded-lg border border-default-200/60 bg-default-50/80 p-4 shadow-sm">
        {content}
      </div>
    );
  }

  return (
    <IBaseCard className="border border-default-200/60 shadow-sm">
      <IBaseCardBody className="p-4">{content}</IBaseCardBody>
    </IBaseCard>
  );
}
