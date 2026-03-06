"use client";

import * as React from "react";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";
import type { HolidayDto } from "@mdl/hrm/client/services/HolidayService";

import { IBaseTooltip } from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { LocaleDataType } from "@base/shared/interface/Locale";
import { StarIcon } from "lucide-react";

import {
  getTimesheetByDate,
  getTimePart,
  getWeekday,
} from "./timesheetViewUtils";
import type { WeekdayItem } from "./utils";

interface TimesheetGridViewProps {
  monthDays: (number | null)[][];
  timesheetList: TimesheetDto[];
  year: number;
  month: number;
  weekdays: WeekdayItem[];
  holidays?: HolidayDto[];
  onDayClick: (day: number) => void;
}

export function TimesheetGridView({
  monthDays,
  timesheetList,
  year,
  month,
  weekdays,
  holidays = [],
  onDayClick,
}: TimesheetGridViewProps): React.ReactElement {
  const getLocalizedText = useLocalizedText();

  const getHolidayForDate = React.useCallback(
    (day: number): HolidayDto | undefined => {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return holidays.find((h) => h.date === dateStr);
    },
    [holidays, year, month],
  );

  return (
    <table className="w-full table-fixed border-collapse">
      <colgroup>
        {weekdays.map((w) => (
          <col key={w.key} style={{ width: "14.28%" }} />
        ))}
      </colgroup>
      <thead>
        <tr className="border-b border-default-200">
          {weekdays.map((w) => (
            <th
              key={w.key}
              className="min-w-0 p-2 text-center text-sm font-medium text-default-600"
            >
              {w.shortName}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {monthDays.map((row, ri) => (
          <tr key={ri} className="border-b border-default-100">
            {row.map((day, di) => {
              if (day === null) {
                return <td key={di} className="p-1" />;
              }
              const ts = getTimesheetByDate(timesheetList, year, month, day);
              const hasData = !!ts;
              const dow = getWeekday(year, month, day);
              const isSunday = dow === 0;
              const isSaturday = dow === 6;
              const holiday = getHolidayForDate(day);
              const isHoliday = !!holiday;

              let cellClass =
                "min-h-[72px] w-full rounded-lg border p-2 text-left text-sm transition-colors flex flex-col items-start ";
              if (isHoliday) {
                cellClass +=
                  "border-amber-400 bg-amber-50 hover:bg-amber-100";
              } else if (hasData) {
                if (isSunday)
                  cellClass +=
                    "border-danger-300 bg-danger-50 hover:bg-danger-100";
                else if (isSaturday)
                  cellClass +=
                    "border-warning-300 bg-warning-50 hover:bg-warning-100";
                else
                  cellClass +=
                    "border-primary-300 bg-primary-50 hover:bg-primary-100";
              } else {
                if (isSunday)
                  cellClass +=
                    "border-danger-200 bg-danger-50/50 hover:bg-danger-100/50";
                else if (isSaturday)
                  cellClass +=
                    "border-warning-200 bg-warning-50/50 hover:bg-warning-100/50";
                else
                  cellClass +=
                    "border-default-200 bg-default-50/50 hover:bg-default-100";
              }

              const holidayName = holiday
                ? getLocalizedText(holiday.name as LocaleDataType<string>)
                : "";

              return (
                <td key={di} className="p-1 align-top">
                  <button
                    className={cellClass}
                    type="button"
                    onClick={() => onDayClick(day)}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-semibold text-default-700">{day}</span>
                      {isHoliday && (
                        <IBaseTooltip content={holidayName}>
                          <StarIcon className="h-4 w-4 fill-amber-400 text-amber-500" />
                        </IBaseTooltip>
                      )}
                    </div>
                    {hasData && ts && (
                      <div className="mt-1 truncate text-xs text-default-600">
                        {ts.checkInTime ? getTimePart(ts.checkInTime) : ""}
                        {ts.checkOutTime
                          ? ` – ${getTimePart(ts.checkOutTime)}`
                          : ""}
                        {ts.actualHours != null ? ` · ${ts.actualHours}h` : ""}
                      </div>
                    )}
                  </button>
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
