"use client";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { timesheetService } from "@mdl/hrm/client/services/TimesheetService";
import { formatDate } from "@base/client/utils/date/formatDate";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseDigitViewer,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
  IBaseSpinner,
} from "@base/client/components";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAYS_VI = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

function getMonthDays(year: number, month: number): (number | null)[][] {
  const first = new Date(year, month - 1, 1);
  const last = new Date(year, month, 0);
  const startDay = (first.getDay() + 6) % 7; // Monday = 0
  const daysInMonth = last.getDate();
  const rows: (number | null)[][] = [];
  let row: (number | null)[] = [];

  for (let i = 0; i < startDay; i++) row.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    row.push(d);
    if (row.length === 7) {
      rows.push(row);
      row = [];
    }
  }
  if (row.length) {
    while (row.length < 7) row.push(null);
    rows.push(row);
  }

  return rows;
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

export default function TimesheetMonthlyPage(): React.ReactNode {
  const t = useTranslations("hrm.timesheets");
  const tCommon = useTranslations("common");
  const getLocalizedText = useLocalizedText();
  const searchParams = useSearchParams();
  const employeeIdFromUrl = searchParams.get("employeeId");

  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(() => today.getFullYear());
  const [month, setMonth] = useState(() => today.getMonth() + 1);
  const [detailTimesheet, setDetailTimesheet] = useState<TimesheetDto | null>(
    null,
  );

  const {
    data: monthData,
    isLoading,
    error: monthError,
  } = useQuery({
    queryKey: ["hrm-timesheets-by-month", year, month, employeeIdFromUrl ?? "me"],
    queryFn: async () => {
      const r = await timesheetService.getByMonth({
        year,
        month,
        employeeId: employeeIdFromUrl ?? undefined,
      });

      return r?.data ?? [];
    },
  });

  const timesheetList = monthData ?? [];
  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);
  const monthLabel = useMemo(
    () =>
      new Date(year, month - 1, 1).toLocaleDateString("vi-VN", {
        month: "long",
        year: "numeric",
      }),
    [year, month],
  );

  const isNextDisabled = useMemo(() => {
    const nowY = today.getFullYear();
    const nowM = today.getMonth() + 1;

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
    const nowY = today.getFullYear();
    const nowM = today.getMonth() + 1;

    if (year > nowY || (year === nowY && month >= nowM)) {
      return;
    }
    if (month === 12) {
      setMonth(1);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  }, [month, today, year]);

  const goCurrent = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  }, [today]);

  const handleDayClick = useCallback(
    (day: number) => {
      const ts = getTimesheetByDate(timesheetList, year, month, day);

      setDetailTimesheet(ts ?? null);
    },
    [timesheetList, year, month],
  );

  if (monthError) {
    const msg = monthError instanceof Error ? monthError.message : String(monthError);
    const isNoEmployeeLinked =
      msg.toLowerCase().includes("no employee linked") ||
      msg.toLowerCase().includes("employee linked");

    return (
      <div className="rounded-xl border border-default-200 bg-default-50 p-6 text-center text-default-600">
        <p className="font-medium">{t("noData")}</p>
        <p className="mt-2 text-sm">
          {isNoEmployeeLinked
            ? "Không tìm thấy nhân viên liên kết với tài khoản của bạn."
            : msg}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-xl font-semibold">
          {t("monthly")} – {monthLabel}
        </h1>
        <div className="flex items-center gap-2">
          <IBaseButton
            size="sm"
            startContent={<ChevronLeft className="size-4" />}
            variant="bordered"
            onPress={goPrev}
          >
            {t("prevMonth")}
          </IBaseButton>
          <IBaseButton
            color="primary"
            size="sm"
            startContent={<Calendar className="size-4" />}
            variant="flat"
            onPress={goCurrent}
          >
            {t("currentMonth")}
          </IBaseButton>
          <IBaseButton
            endContent={<ChevronRight className="size-4" />}
            isDisabled={isNextDisabled}
            size="sm"
            variant="bordered"
            onPress={goNext}
          >
            {t("nextMonth")}
          </IBaseButton>
        </div>
      </div>

      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <IBaseSpinner size="lg" />
            </div>
          ) : (
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b border-default-200">
                  {WEEKDAYS_VI.map((d) => (
                    <th
                      key={d}
                      className="p-2 text-center text-sm font-medium text-default-600"
                    >
                      {d}
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
                            className={`min-h-[72px] w-full rounded-lg border p-2 text-left text-sm transition-colors ${
                              hasData
                                ? "border-primary-300 bg-primary-50 hover:bg-primary-100"
                                : "border-default-200 bg-default-50/50 hover:bg-default-100"
                            }`}
                            type="button"
                            onClick={() => handleDayClick(day)}
                          >
                            <span className="font-medium">{day}</span>
                            {hasData && ts && (
                              <div className="mt-1 truncate text-xs text-default-600">
                                {ts.checkInTime
                                  ? (formatDate(ts.checkInTime).split(" ")[1] ??
                                    "")
                                  : ""}
                                {ts.checkOutTime
                                  ? ` – ${formatDate(ts.checkOutTime).split(" ")[1] ?? ""}`
                                  : ""}
                                {ts.actualHours != null
                                  ? ` · ${ts.actualHours}h`
                                  : ""}
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
          )}
        </IBaseCardBody>
      </IBaseCard>

      <IBaseModal
        isOpen={!!detailTimesheet}
        size="2xl"
        onOpenChange={(open) => !open && setDetailTimesheet(null)}
      >
        <IBaseModalContent>
          <IBaseModalHeader className="flex flex-col gap-1">
            {detailTimesheet && (
              <>
                <span>
                  {getLocalizedText(detailTimesheet.employee?.fullName) ||
                    detailTimesheet.employee?.employeeCode ||
                    ""}
                </span>
                <span className="text-sm font-normal text-default-500">
                  {formatDate(detailTimesheet.workDate)}
                </span>
              </>
            )}
          </IBaseModalHeader>
          <IBaseModalBody>
            {detailTimesheet && (
              <div className="grid gap-2 md:grid-cols-2">
                <IBaseDigitViewer
                  label={t("labels.employee")}
                  value={
                    getLocalizedText(detailTimesheet.employee?.fullName) ||
                    detailTimesheet.employee?.employeeCode ||
                    "—"
                  }
                />
                <IBaseDigitViewer
                  label={t("labels.workDate")}
                  value={formatDate(detailTimesheet.workDate)}
                />
                <IBaseDigitViewer
                  label={t("labels.shift")}
                  value={getLocalizedText(detailTimesheet.shift?.name)}
                />
                <IBaseDigitViewer
                  label={t("labels.checkInTime")}
                  value={
                    detailTimesheet.checkInTime
                      ? formatDate(detailTimesheet.checkInTime)
                      : "—"
                  }
                />
                <IBaseDigitViewer
                  label={t("labels.checkOutTime")}
                  value={
                    detailTimesheet.checkOutTime
                      ? formatDate(detailTimesheet.checkOutTime)
                      : "—"
                  }
                />
                <IBaseDigitViewer
                  label={t("labels.actualHours")}
                  value={
                    detailTimesheet.actualHours != null
                      ? `${detailTimesheet.actualHours}h`
                      : "—"
                  }
                />
                <IBaseDigitViewer
                  label={t("labels.status")}
                  value={detailTimesheet.status}
                />
                <IBaseDigitViewer
                  label={t("labels.notes")}
                  value={detailTimesheet.notes || "—"}
                />
              </div>
            )}
          </IBaseModalBody>
          <IBaseModalFooter>
            {detailTimesheet && (
              <IBaseButton
                color="primary"
                onPress={() => {
                  setDetailTimesheet(null);
                  window.location.href = `/workspace/modules/hrm/timesheets/edit/${detailTimesheet.id}`;
                }}
              >
                {tCommon("actions.edit")}
              </IBaseButton>
            )}
            <IBaseButton
              variant="bordered"
              onPress={() => setDetailTimesheet(null)}
            >
              {tCommon("actions.close")}
            </IBaseButton>
          </IBaseModalFooter>
        </IBaseModalContent>
      </IBaseModal>
    </div>
  );
}
