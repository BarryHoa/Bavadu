"use client";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

import { holidayService } from "@mdl/hrm/client/services/HolidayService";
import { timesheetService } from "@mdl/hrm/client/services/TimesheetService";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import {
  TimesheetCalendarGrid,
  TimesheetDetailModal,
  TimesheetErrorState,
  TimesheetMonthNav,
  type TimesheetViewMode,
} from "./components";
import { getMonthDays } from "./components/utils";

const WEEKDAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function TimesheetMonthlyPage(): React.ReactNode {
  const t = useTranslations("hrm.timesheets");
  const tPicker = useTranslations("base.components.picker");
  const today = useMemo(() => dayjs(), []);
  const [year, setYear] = useState(() => today.year());
  const [month, setMonth] = useState(() => today.month() + 1);
  const [detailTimesheet, setDetailTimesheet] = useState<TimesheetDto | null>(
    null,
  );
  const [viewMode, setViewMode] = useState<TimesheetViewMode>("grid");

  const dataWeek = useMemo(
    () =>
      WEEKDAYS.map((key) => ({
        key,
        name: tPicker(`date.weekdays.${key}`),
        shortName: tPicker(`date.shortWeekdays.${key}`),
      })),
    [tPicker],
  );

  const {
    data: monthData,
    isLoading,
    error: monthError,
  } = useQuery({
    queryKey: ["hrm-monthly-timesheet", year, month, "me"],
    queryFn: async () => {
      const r = await timesheetService.getMyTimesheet({ year, month });

      return r?.data ?? [];
    },
  });

  const { data: holidaysData } = useQuery({
    queryKey: ["base-holidays", year, month],
    queryFn: async () => {
      const r = await holidayService.getHolidaysForWorkingDays({
        year,
        month,
      });

      return r?.data ?? [];
    },
  });

  const timesheetList = monthData ?? [];
  const holidays = holidaysData ?? [];
  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);
  const monthLabel = useMemo(
    () =>
      dayjs()
        .year(year)
        .month(month - 1)
        .date(1)
        .locale("vi")
        .format("MMMM YYYY"),
    [year, month],
  );

  const isNextDisabled = useMemo(() => {
    const nowY = today.year();
    const nowM = today.month() + 1;

    return year > nowY || (year === nowY && month >= nowM);
  }, [today, year, month]);

  const goPrev = useCallback(() => {
    if (month === 1) {
      setMonth(12);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  }, [month]);

  const goNext = useCallback(() => {
    const nowY = today.year();
    const nowM = today.month() + 1;

    if (year > nowY || (year === nowY && month >= nowM)) return;
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month, today, year]);

  const goCurrent = useCallback(() => {
    setYear(today.year());
    setMonth(today.month() + 1);
  }, [today]);

  const handleDayClick = useCallback(
    (day: number) => {
      const ts = timesheetList.find((t) => {
        const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        return t.workDate === dateStr;
      });

      setDetailTimesheet(ts ?? null);
    },
    [timesheetList, year, month],
  );

  if (monthError) {
    const msg =
      monthError instanceof Error ? monthError.message : String(monthError);
    const isNoEmployeeLinked =
      msg.toLowerCase().includes("no employee linked") ||
      msg.toLowerCase().includes("employee linked");

    return (
      <TimesheetErrorState
        detail={
          isNoEmployeeLinked
            ? "Không tìm thấy nhân viên liên kết với tài khoản của bạn."
            : msg
        }
        title={t("noData")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <TimesheetMonthNav
        isNextDisabled={isNextDisabled}
        monthLabel={monthLabel}
        onCurrent={goCurrent}
        onNext={goNext}
        onPrev={goPrev}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      <TimesheetCalendarGrid
        isLoading={isLoading}
        month={month}
        monthDays={monthDays}
        timesheetList={timesheetList}
        holidays={holidays}
        viewMode={viewMode}
        weekdays={dataWeek}
        year={year}
        onDayClick={handleDayClick}
      />
      <TimesheetDetailModal
        timesheet={detailTimesheet}
        onClose={() => setDetailTimesheet(null)}
      />
    </div>
  );
}
