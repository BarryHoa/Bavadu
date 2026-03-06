"use client";

import * as React from "react";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

import IBaseSpinnerContent from "@/module-base/client/components/IBaseSpinnerContent";
import { IBaseCard, IBaseCardBody } from "@base/client/components";

import type { TimesheetViewMode } from "./TimesheetMonthNav";
import type { WeekdayItem } from "./utils";
import { TimesheetGridView } from "./TimesheetGridView";
import { TimesheetStatistics } from "./TimesheetStatistics";
import { TimesheetTableView } from "./TimesheetTableView";

interface TimesheetCalendarGridProps {
  isLoading: boolean;
  monthDays: (number | null)[][];
  timesheetList: TimesheetDto[];
  viewMode: TimesheetViewMode;
  year: number;
  month: number;
  weekdays: WeekdayItem[];
  onDayClick: (day: number) => void;
}

export function TimesheetCalendarGrid({
  isLoading,
  monthDays,
  timesheetList,
  viewMode,
  year,
  month,
  weekdays,
  onDayClick,
}: TimesheetCalendarGridProps): React.ReactNode {
  return (
    <IBaseCard className="border border-default-200/60 shadow-sm overflow-visible">
      <IBaseCardBody className="p-4 overflow-visible">
        <IBaseSpinnerContent spinning={isLoading}>
          {viewMode === "grid" ? (
            <div className="flex flex-col gap-4">
              <TimesheetStatistics
                timesheetList={timesheetList}
                year={year}
                month={month}
                variant="default"
              />
              <TimesheetGridView
                monthDays={monthDays}
                timesheetList={timesheetList}
                year={year}
                month={month}
                weekdays={weekdays}
                onDayClick={onDayClick}
              />
            </div>
          ) : (
            <div className="flex gap-4 overflow-visible">
              <div className="min-w-0 flex-[7] overflow-auto">
                <TimesheetTableView
                  timesheetList={timesheetList}
                  year={year}
                  month={month}
                  onDayClick={onDayClick}
                />
              </div>
              <div className="flex-[3] flex-shrink-0 self-start">
                <TimesheetStatistics
                  timesheetList={timesheetList}
                  year={year}
                  month={month}
                  variant="sidebar"
                />
              </div>
            </div>
          )}
        </IBaseSpinnerContent>
      </IBaseCardBody>
    </IBaseCard>
  );
}
