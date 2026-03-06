"use client";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

import IBaseSpinnerContent from "@/module-base/client/components/IBaseSpinnerContent";
import { IBaseCard, IBaseCardBody } from "@base/client/components";
import { formatDateWithTime } from "@base/client/utils/date/formatDate";

import type { WeekdayItem } from "./utils";

interface TimesheetCalendarGridProps {
  isLoading: boolean;
  monthDays: (number | null)[][];
  timesheetList: TimesheetDto[];
  year: number;
  month: number;
  weekdays: WeekdayItem[];
  onDayClick: (day: number) => void;
}

function getTimesheetByDate(
  list: TimesheetDto[],
  year: number,
  month: number,
  day: number,
): TimesheetDto | undefined {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return list.find((t) => t.workDate === dateStr);
}

function getTimePart(value: string | number): string {
  return formatDateWithTime(value).split(" ")[1] ?? "";
}

const getTsVal = (ts: TimesheetDto | undefined): string => {
  if (!ts) return "";
  return [
    ts.checkInTime ? getTimePart(ts.checkInTime) : "",
    ts.checkOutTime ? ` – ${getTimePart(ts.checkOutTime)}` : "",
  ].join(" - ");
};
export function TimesheetCalendarGrid({
  isLoading,
  monthDays,
  timesheetList,
  year,
  month,
  weekdays,
  onDayClick,
}: TimesheetCalendarGridProps): React.ReactNode {
  return (
    <IBaseCard className="border border-default-200/60 shadow-sm">
      <IBaseCardBody className="p-4">
        <IBaseSpinnerContent spinning={isLoading}>
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="border-b border-default-200">
                {weekdays.map((w) => (
                  <th
                    key={w.key}
                    className="p-2 text-center text-sm font-medium text-default-600"
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
                    const ts = getTimesheetByDate(
                      timesheetList,
                      year,
                      month,
                      day,
                    );
                    const hasData = !!ts;

                    return (
                      <td key={di} className="p-1 align-top">
                        <button
                          className={`flex min-h-[72px] w-full flex-col items-start rounded-lg border p-2 text-left text-sm transition-colors ${
                            hasData
                              ? "border-primary-300 bg-primary-50 hover:bg-primary-100"
                              : "border-default-200 bg-default-50/50 hover:bg-default-100"
                          }`}
                          type="button"
                          onClick={() => onDayClick(day)}
                        >
                          <span className="font-medium">{day}</span>
                          {hasData && ts && (
                            <div className="mt-1 w-full truncate text-xs text-default-600">
                              {getTsVal(ts)}
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
        </IBaseSpinnerContent>
      </IBaseCardBody>
    </IBaseCard>
  );
}
