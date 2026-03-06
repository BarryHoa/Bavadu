"use client";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";
import type { EmployeeDto } from "@mdl/hrm/client/services/EmployeeService";

import { employeeService } from "@mdl/hrm/client/services/EmployeeService";
import { holidayService } from "@mdl/hrm/client/services/HolidayService";
import { timesheetService } from "@mdl/hrm/client/services/TimesheetService";

import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseImportTemplate,
  IBaseSelect,
} from "@base/client/components";
import IBaseSelectItem from "@base/client/components/IBaseSelect/IBaseSelectItem";
import IBaseSpinnerContent from "@base/client/components/IBaseSpinnerContent";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { usePermission } from "@base/client/hooks";
import { CalendarDays, ChevronLeft, ChevronRight, Download, Upload, Users } from "lucide-react";

import { TimesheetDetailModal, TimesheetTableView } from "./components";
import { TimesheetStatistics } from "./components/TimesheetStatistics";

export default function TimesheetAllPage(): React.ReactNode {
  const t = useTranslations("hrm.timesheets");
  const getLocalizedText = useLocalizedText();
  const { hasPermission } = usePermission();
  const canImport = hasPermission("hrm.timesheet.import");
  const canExport = hasPermission("hrm.timesheet.export");

  const today = useMemo(() => dayjs(), []);
  const [year, setYear] = useState(() => today.year());
  const [month, setMonth] = useState(() => today.month() + 1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [detailTimesheet, setDetailTimesheet] = useState<TimesheetDto | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { data: employeesData, isLoading: employeesLoading } = useQuery({
    queryKey: ["hrm-employees-list"],
    queryFn: async () => {
      const r = await employeeService.list();
      return r?.data ?? [];
    },
  });

  const employees = employeesData ?? [];

  const employeeOptions = useMemo(() => {
    return employees.map((emp: EmployeeDto) => ({
      key: emp.id,
      label: `${emp.firstName} ${emp.lastName}`.trim() || emp.employeeCode,
    }));
  }, [employees]);

  const {
    data: monthData,
    isLoading: timesheetLoading,
  } = useQuery({
    queryKey: ["hrm-timesheet-by-user", selectedUserId, year, month],
    queryFn: async () => {
      if (!selectedUserId) return [];
      const r = await timesheetService.getTimesheetsByUserId({
        userId: selectedUserId,
        year,
        month,
      });
      return r?.data ?? [];
    },
    enabled: !!selectedUserId,
  });

  const { data: holidaysData } = useQuery({
    queryKey: ["hrm-holidays-month", year, month],
    queryFn: async () => {
      const r = await holidayService.getByMonth(year, month);
      return r ?? [];
    },
  });

  const timesheetList = monthData ?? [];
  const holidays = holidaysData ?? [];

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

  const openImport = useCallback(() => setImportOpen(true), []);
  const closeImport = useCallback(() => setImportOpen(false), []);

  const selectedEmployee = employees.find((e: EmployeeDto) => e.id === selectedUserId);
  const selectedEmployeeName = selectedEmployee
    ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`.trim() + ` (${selectedEmployee.employeeCode})`
    : "";

  return (
    <div className="space-y-6">
      <IBaseCard className="border border-default-200/60 shadow-sm">
        <IBaseCardBody className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <IBaseSelect
                aria-label={t("selectEmployee")}
                placeholder={t("selectEmployeePlaceholder")}
                selectedKeys={selectedUserId ? [selectedUserId] : []}
                onSelectionChange={(keys) => {
                  const arr = Array.from(keys);
                  setSelectedUserId(arr.length > 0 ? String(arr[0]) : null);
                }}
                isLoading={employeesLoading}
                selectionMode="single"
                startContent={<Users className="h-4 w-4 text-default-400" />}
                className="w-72"
                classNames={{
                  trigger: "h-10 min-h-10",
                }}
              >
                {employeeOptions.map((emp) => (
                  <IBaseSelectItem key={emp.key}>{emp.label}</IBaseSelectItem>
                ))}
              </IBaseSelect>

              <div className="flex h-10 items-center gap-1 rounded-lg border border-default-200 bg-default-50/50 px-1">
                <IBaseButton
                  isIconOnly
                  size="sm"
                  variant="light"
                  onPress={goPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                </IBaseButton>
                <span className="min-w-[140px] px-2 text-center font-medium capitalize text-default-700">
                  {monthLabel}
                </span>
                <IBaseButton
                  isIconOnly
                  size="sm"
                  variant="light"
                  isDisabled={isNextDisabled}
                  onPress={goNext}
                >
                  <ChevronRight className="h-4 w-4" />
                </IBaseButton>
                <div className="mx-1 h-5 w-px bg-default-200" />
                <IBaseButton
                  size="sm"
                  variant="light"
                  onPress={goCurrent}
                  isDisabled={year === today.year() && month === today.month() + 1}
                  className="text-primary"
                >
                  {t("currentMonth")}
                </IBaseButton>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canImport && (
                <IBaseButton
                  color="primary"
                  variant="flat"
                  size="sm"
                  onPress={openImport}
                  startContent={<Upload className="h-4 w-4" />}
                >
                  {t("import")}
                </IBaseButton>
              )}
              {canExport && (
                <IBaseButton
                  color="primary"
                  variant="bordered"
                  size="sm"
                  isDisabled
                  startContent={<Download className="h-4 w-4" />}
                >
                  {t("export")}
                </IBaseButton>
              )}
            </div>
          </div>
        </IBaseCardBody>
      </IBaseCard>

      {selectedUserId ? (
        <div className="space-y-4">
          {selectedEmployeeName && (
            <div className="flex items-center gap-2 text-lg font-medium text-default-700">
              <Users className="h-5 w-5 text-primary" />
              <span>{selectedEmployeeName}</span>
            </div>
          )}
          <IBaseCard className="border border-default-200/60 shadow-sm overflow-visible">
            <IBaseCardBody className="p-4 overflow-visible">
              <IBaseSpinnerContent spinning={timesheetLoading}>
                <div className="flex gap-6 overflow-visible">
                  <div className="min-w-0 flex-1 overflow-auto">
                    <TimesheetTableView
                      timesheetList={timesheetList}
                      year={year}
                      month={month}
                      onDayClick={handleDayClick}
                    />
                  </div>
                  <div className="w-72 flex-shrink-0 self-start">
                    <TimesheetStatistics
                      timesheetList={timesheetList}
                      year={year}
                      month={month}
                      holidays={holidays.map((h) => h.date)}
                      variant="sidebar"
                    />
                  </div>
                </div>
              </IBaseSpinnerContent>
            </IBaseCardBody>
          </IBaseCard>
        </div>
      ) : (
        <IBaseCard className="border border-default-200/60 shadow-sm">
          <IBaseCardBody className="py-16">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="rounded-full bg-primary-50 p-4">
                <CalendarDays className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-default-700">
                  {t("allPeople")}
                </h3>
                <p className="max-w-md text-sm text-default-500">
                  {t("selectEmployeeToView")}
                </p>
              </div>
            </div>
          </IBaseCardBody>
        </IBaseCard>
      )}

      <TimesheetDetailModal
        timesheet={detailTimesheet}
        onClose={() => setDetailTimesheet(null)}
      />

      {canImport && (
        <IBaseImportTemplate
          isOpen={importOpen}
          onOpenChange={setImportOpen}
          templateKey="hrm.timesheet"
          title={t("importTimesheet")}
          requiredPermission="hrm.timesheet.import"
          onSuccess={() => closeImport()}
        />
      )}
    </div>
  );
}
