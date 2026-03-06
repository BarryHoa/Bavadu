"use client";

import * as React from "react";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

import { useTranslations } from "next-intl";

import {
  getDateWithShortWeekday,
  getTimesheetByDate,
  getTimeDisplay,
  getWeekday,
} from "./timesheetViewUtils";

interface TimesheetTableViewProps {
  timesheetList: TimesheetDto[];
  year: number;
  month: number;
  onDayClick: (day: number) => void;
}

export function TimesheetTableView({
  timesheetList,
  year,
  month,
  onDayClick,
}: TimesheetTableViewProps): React.ReactElement {
  const t = useTranslations("hrm.timesheets");

  const listDays = React.useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const workDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const ts = getTimesheetByDate(timesheetList, year, month, day);

      return { day, workDate, ts };
    });
  }, [year, month, timesheetList]);

  return (
    <table className="w-full table-fixed border-collapse text-sm">
      <colgroup>
        <col style={{ width: "9rem" }} />
        <col style={{ width: "11rem" }} />
        <col />
      </colgroup>
      <thead>
        <tr className="border-b border-default-200 bg-default-50/80">
          <th className="min-w-0 p-3 text-left font-medium text-default-700">
            {t("listDate")}
          </th>
          <th className="min-w-0 p-3 text-left font-medium text-default-700">
            {t("listTime")}
          </th>
          <th className="min-w-0 p-3 text-left font-medium text-default-700">
            {t("listNote")}
          </th>
        </tr>
      </thead>
      <tbody>
        {listDays.map(({ day, workDate, ts }) => {
          const dow = getWeekday(year, month, day);
          const isSunday = dow === 0;
          const isSaturday = dow === 6;
          const rowBg = isSunday
            ? "bg-danger-50"
            : isSaturday
              ? "bg-warning-50"
              : "";
          const hoverBg = isSunday
            ? "hover:bg-danger-100 hover:border-l-danger-400"
            : isSaturday
              ? "hover:bg-warning-100 hover:border-l-warning-400"
              : "hover:bg-primary-50/70 hover:border-l-primary-400";

          return (
            <tr
              key={workDate}
              className={`border-b border-l-2 border-l-transparent border-default-100 ${rowBg} cursor-pointer transition-colors ${hoverBg}`}
              role="button"
              tabIndex={0}
              onClick={() => onDayClick(day)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onDayClick(day);
                }
              }}
            >
              <td className="min-w-0 truncate p-3 font-medium text-default-800">
                {getDateWithShortWeekday(workDate)}
              </td>
              <td className="min-w-0 truncate p-3 text-default-600">
                {ts ? getTimeDisplay(ts) : "—"}
              </td>
              <td className="min-w-0 truncate p-3 text-default-600">
                {ts?.notes?.trim() || "—"}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
