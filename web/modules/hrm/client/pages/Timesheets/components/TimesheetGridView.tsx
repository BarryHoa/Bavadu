"use client";

import * as React from "react";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

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
  onDayClick: (day: number) => void;
}

export function TimesheetGridView({
  monthDays,
  timesheetList,
  year,
  month,
  weekdays,
  onDayClick,
}: TimesheetGridViewProps): React.ReactElement {
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

              let cellClass =
                "min-h-[72px] w-full rounded-lg border p-2 text-left text-sm transition-colors ";
              if (hasData) {
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

              return (
                <td key={di} className="p-1 align-top">
                  <button
                    className={cellClass}
                    type="button"
                    onClick={() => onDayClick(day)}
                  >
                    <span className="font-medium">{day}</span>
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
