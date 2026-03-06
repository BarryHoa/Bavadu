import dayjs from "dayjs";
import "dayjs/locale/vi";

import type { TimesheetDto } from "@mdl/hrm/client/interface/Timesheet";

import {
  formatDate,
  formatDateWithTime,
} from "@base/client/utils/date/formatDate";

export function getTimesheetByDate(
  list: TimesheetDto[],
  year: number,
  month: number,
  day: number,
): TimesheetDto | undefined {
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return list.find((t) => t.workDate === dateStr);
}

export function getTimePart(value: string | number): string {
  return formatDateWithTime(value).split(" ")[1] ?? "";
}

/** Short weekday + date for list column, e.g. "T2, 01/03/2026". */
export function getDateWithShortWeekday(workDate: string | undefined): string {
  if (!workDate) return "—";
  const d = dayjs(workDate).locale("vi");
  const shortDay = d.format("dd");
  const dateStr = formatDate(workDate);

  return dateStr ? `${shortDay}, ${dateStr}` : "—";
}

export function getTimeDisplay(ts: TimesheetDto): string {
  const inPart = ts.checkInTime ? getTimePart(ts.checkInTime) : "";
  const outPart = ts.checkOutTime ? getTimePart(ts.checkOutTime) : "";
  const parts = [inPart, outPart].filter(Boolean);

  if (parts.length === 0) return "—";
  const timeStr = parts.join(" – ");
  const hours = ts.actualHours != null ? ` · ${ts.actualHours}h` : "";

  return `${timeStr}${hours}`;
}

/** 0 = Sunday, 6 = Saturday. */
export function getWeekday(year: number, month: number, day: number): number {
  return new Date(year, month - 1, day).getDay();
}
