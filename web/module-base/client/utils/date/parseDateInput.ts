import { SYSTEM_TIMEZONE } from "@base/shared/constants";
import { CalendarDate } from "@internationalized/date";
import type { DateValue } from "@react-types/calendar";
import type { RangeValue } from "@react-types/shared";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isoWeek from "dayjs/plugin/isoWeek";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export type { Dayjs } from "dayjs";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(isoWeek);

export type DateLike = string | number | Date | Dayjs | null | undefined;
export type DateRangeLike =
  | { start: DateLike; end: DateLike }
  | null
  | undefined;

const DEFAULT_DATE_FORMAT = "YYYY-MM-DD";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isDigitsOnly(s: string) {
  return /^\d+$/.test(s);
}

type FormatToken = "YYYY" | "YY" | "MM" | "DD" | "HH" | "mm" | "ss";
type FormatPart =
  | { type: "token"; token: FormatToken }
  | { type: "literal"; value: string };

function splitFormat(format: string): FormatPart[] {
  const tokenRe = /(YYYY|YY|MM|DD|HH|mm|ss)/g;
  const parts: FormatPart[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  while ((m = tokenRe.exec(format))) {
    const idx = m.index;
    if (idx > lastIdx) {
      parts.push({ type: "literal", value: format.slice(lastIdx, idx) });
    }
    parts.push({ type: "token", token: m[1] as FormatToken });
    lastIdx = idx + m[1].length;
  }
  if (lastIdx < format.length) {
    parts.push({ type: "literal", value: format.slice(lastIdx) });
  }
  return parts;
}

function tokenLen(token: FormatToken): number {
  switch (token) {
    case "YYYY":
      return 4;
    case "YY":
      return 2;
    case "MM":
    case "DD":
    case "HH":
    case "mm":
    case "ss":
      return 2;
  }
}

/**
 * Normalize a digits-only input into the provided format.
 * Example: input `17122025` + format `DD/MM/YYYY` => `17/12/2025`.
 * Returns null if it doesn't match expected length/tokens.
 */
export function normalizeDigitsToFormat(
  digits: string,
  format: string,
): string | null {
  const parts = splitFormat(format);
  const tokens = parts.filter((p) => p.type === "token") as Array<
    Extract<FormatPart, { type: "token" }>
  >;
  const expectedLen = tokens.reduce((sum, t) => sum + tokenLen(t.token), 0);
  if (digits.length !== expectedLen) return null;
  if (!isDigitsOnly(digits)) return null;

  let cursor = 0;
  const tokenValues: Record<FormatToken, string[]> = {
    YYYY: [],
    YY: [],
    MM: [],
    DD: [],
    HH: [],
    mm: [],
    ss: [],
  };

  for (const t of tokens) {
    const len = tokenLen(t.token);
    const slice = digits.slice(cursor, cursor + len);
    tokenValues[t.token].push(slice);
    cursor += len;
  }

  // Rebuild output by walking format parts in order and consuming values.
  const consumed: Record<FormatToken, number> = {
    YYYY: 0,
    YY: 0,
    MM: 0,
    DD: 0,
    HH: 0,
    mm: 0,
    ss: 0,
  };

  let out = "";
  for (const p of parts) {
    if (p.type === "literal") {
      out += p.value;
      continue;
    }
    const i = consumed[p.token]++;
    const v = tokenValues[p.token][i];
    if (v == null) return null;
    out += v;
  }
  return out;
}

export function formatDayjs(
  value: Dayjs,
  format: string,
  tz: string = SYSTEM_TIMEZONE,
) {
  return value.tz(tz).format(format);
}

export function nowInTz(tz: string = SYSTEM_TIMEZONE) {
  return dayjs().tz(tz);
}

/**
 * Parse a string strictly with the given format, then re-create the value in a timezone.
 * This avoids timezone drift while keeping strict parsing semantics.
 */
export function parseStrictInTz(
  text: string,
  format: string,
  tz: string = SYSTEM_TIMEZONE,
): Dayjs | null {
  const parsed = dayjs(text, format, true);
  if (!parsed.isValid()) return null;

  const hasTime = /H|m|s/.test(format);

  const y = parsed.year();
  const mo = parsed.month() + 1;
  const d = parsed.date();
  const hh = hasTime ? parsed.hour() : 0;
  const mm = hasTime ? parsed.minute() : 0;
  const ss = hasTime ? parsed.second() : 0;

  const iso = `${y}-${pad2(mo)}-${pad2(d)} ${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`;
  const tzParsed = dayjs.tz(iso, "YYYY-MM-DD HH:mm:ss", tz);
  return tzParsed.isValid() ? tzParsed : null;
}

export function toDayjs(
  value: DateLike,
  format: string = DEFAULT_DATE_FORMAT,
  tz: string = SYSTEM_TIMEZONE,
): Dayjs | null {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value.tz(tz);
  if (typeof value === "number") {
    const d = dayjs(value).tz(tz);
    return d.isValid() ? d : null;
  }
  if (value instanceof Date) {
    const d = dayjs(value).tz(tz);
    return d.isValid() ? d : null;
  }

  const text = value.trim();
  if (!text) return null;

  // Strict parse by format first.
  const strict = parseStrictInTz(text, format, tz);
  if (strict) return strict;

  // Allow digits-only input (ddmmyyyy etc.) and normalize.
  if (isDigitsOnly(text)) {
    const normalized = normalizeDigitsToFormat(text, format);
    if (normalized) {
      const strict2 = parseStrictInTz(normalized, format, tz);
      if (strict2) return strict2;
    }
  }

  // Fallback: try dayjs parser (ISO, timestamps, etc.) then tz.
  const fallback = dayjs(text);
  if (fallback.isValid()) return fallback.tz(tz);

  return null;
}

export function dayjsToCalendarDate(
  value: Dayjs,
  tz: string = SYSTEM_TIMEZONE,
): CalendarDate {
  const d = value.tz(tz);
  return new CalendarDate(d.year(), d.month() + 1, d.date());
}

export function calendarDateToDayjs(
  value: DateValue,
  tz: string = SYSTEM_TIMEZONE,
): Dayjs {
  // CalendarDate.toString() => YYYY-MM-DD
  const iso = value.toString();
  return dayjs.tz(iso, "YYYY-MM-DD", tz);
}

export function toCalendarDateValue(
  value: DateLike,
  format: string,
  tz: string = SYSTEM_TIMEZONE,
): CalendarDate | null {
  const d = toDayjs(value, format, tz);
  return d ? dayjsToCalendarDate(d, tz) : null;
}

export function toRangeCalendarValue(
  value: DateRangeLike,
  format: string,
  tz: string = SYSTEM_TIMEZONE,
): RangeValue<CalendarDate> | null {
  if (!value) return null;
  const start = toCalendarDateValue(value.start, format, tz);
  const end = toCalendarDateValue(value.end, format, tz);
  if (!start || !end) return null;
  return { start, end };
}


