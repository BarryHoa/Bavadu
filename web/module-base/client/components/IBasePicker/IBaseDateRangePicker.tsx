"use client";

import IBaseInput from "@base/client/components/IBaseInput";
import { SYSTEM_TIMEZONE } from "@base/shared/constants";
import { Button } from "@heroui/button";
import { RangeCalendar } from "@heroui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import type { InputProps } from "@heroui/input";
import type { DateValue } from "@react-types/calendar";
import type { RangeValue } from "@react-types/shared";
import clsx from "clsx";
import { Calendar as CalendarIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { Dayjs } from "dayjs";
import {
  calendarDateToDayjs,
  dayjsToCalendarDate,
  formatDayjs,
  toDayjs,
  type DateLike,
} from "../../utils/date/parseDateInput";
import { nowInTz } from "../../utils/date/parseDateInput";

export type IBaseDateRangePickerValue =
  | { start: string | Dayjs | null; end: string | Dayjs | null }
  | null;

export interface RangePreset {
  key: string;
  label: React.ReactNode;
  range: (now: Dayjs) => { start: Dayjs; end: Dayjs };
}

export interface IBaseDateRangePickerProps
  extends Omit<
    InputProps,
    | "value"
    | "defaultValue"
    | "onChange"
    | "onValueChange"
    | "type"
    | "startContent"
    | "endContent"
  > {
  value?: IBaseDateRangePickerValue;
  defaultValue?: IBaseDateRangePickerValue;
  onChange?: (value: { start: string | null; end: string | null } | null) => void;
  format?: string;
  minDate?: string | Dayjs;
  maxDate?: string | Dayjs;
  timezone?: string;
  presets?: RangePreset[];
  dropdownRenderer?: (params: {
    content: React.ReactNode;
    close: () => void;
    isOpen: boolean;
  }) => React.ReactNode;
}

const DEFAULT_FORMAT = "YYYY-MM-DD";

function defaultPresets(tz: string): RangePreset[] {
  return [
    {
      key: "today",
      label: "Today",
      range: (now) => ({
        start: now.startOf("day"),
        end: now.endOf("day"),
      }),
    },
    {
      key: "this_week",
      label: "Tuần này",
      range: (now) => ({
        start: now.startOf("isoWeek"),
        end: now.endOf("isoWeek"),
      }),
    },
    {
      key: "last_week",
      label: "Tuần trước",
      range: (now) => {
        const n = now.subtract(1, "week");
        return { start: n.startOf("isoWeek"), end: n.endOf("isoWeek") };
      },
    },
    {
      key: "this_month",
      label: "Tháng này",
      range: (now) => ({ start: now.startOf("month"), end: now.endOf("month") }),
    },
    {
      key: "last_month",
      label: "Tháng trước",
      range: (now) => {
        const n = now.subtract(1, "month");
        return { start: n.startOf("month"), end: n.endOf("month") };
      },
    },
    {
      key: "last_3_months",
      label: "3 tháng gần nhất",
      range: (now) => ({
        start: now.subtract(2, "month").startOf("month"),
        end: now.endOf("month"),
      }),
    },
    {
      key: "last_6_months",
      label: "6 tháng gần nhất",
      range: (now) => ({
        start: now.subtract(5, "month").startOf("month"),
        end: now.endOf("month"),
      }),
    },
    {
      key: "this_year",
      label: "Năm nay",
      range: (now) => ({ start: now.startOf("year"), end: now.endOf("year") }),
    },
    {
      key: "last_year",
      label: "Năm trước",
      range: (now) => {
        const n = now.subtract(1, "year");
        return { start: n.startOf("year"), end: n.endOf("year") };
      },
    },
    {
      key: "last_2_years",
      label: "2 năm gần nhất",
      range: (now) => ({
        start: now.subtract(1, "year").startOf("year"),
        end: now.endOf("year"),
      }),
    },
    {
      key: "last_3_years",
      label: "3 năm gần nhất",
      range: (now) => ({
        start: now.subtract(2, "year").startOf("year"),
        end: now.endOf("year"),
      }),
    },
    {
      key: "last_5_years",
      label: "5 năm gần nhất",
      range: (now) => ({
        start: now.subtract(4, "year").startOf("year"),
        end: now.endOf("year"),
      }),
    },
  ].map((p) => ({
    ...p,
    range: (now) => {
      const n = now.tz(tz);
      return p.range(n);
    },
  }));
}

function toDayjsSafe(value: DateLike, format: string, tz: string): Dayjs | null {
  return toDayjs(value, format, tz);
}

export default function IBaseDateRangePicker(props: IBaseDateRangePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    format = DEFAULT_FORMAT,
    minDate,
    maxDate,
    timezone = SYSTEM_TIMEZONE,
    presets,
    dropdownRenderer,
    isDisabled,
    endContent,
    className,
    onKeyDown,
    onClick,
    label,
    errorMessage,
    isInvalid,
    ...rest
  } = props;

  const hasTime = useMemo(() => /H|m|s/.test(format), [format]);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] =
    useState<IBaseDateRangePickerValue>(defaultValue ?? null);

  const committedValue: IBaseDateRangePickerValue =
    value !== undefined ? value : uncontrolledValue;

  const committedStart = useMemo(
    () => toDayjsSafe(committedValue?.start, format, timezone),
    [committedValue?.start, format, timezone],
  );
  const committedEnd = useMemo(
    () => toDayjsSafe(committedValue?.end, format, timezone),
    [committedValue?.end, format, timezone],
  );

  const committedStartText = useMemo(
    () => (committedStart ? formatDayjs(committedStart, format, timezone) : ""),
    [committedStart, format, timezone],
  );
  const committedEndText = useMemo(
    () => (committedEnd ? formatDayjs(committedEnd, format, timezone) : ""),
    [committedEnd, format, timezone],
  );

  const minDayjs = useMemo(
    () => (minDate ? toDayjs(minDate, format, timezone) : null),
    [minDate, format, timezone],
  );
  const maxDayjs = useMemo(
    () => (maxDate ? toDayjs(maxDate, format, timezone) : null),
    [maxDate, format, timezone],
  );

  const minValue = useMemo(() => {
    if (!minDayjs) return undefined;
    return dayjsToCalendarDate(minDayjs, timezone);
  }, [minDayjs, timezone]);
  const maxValue = useMemo(() => {
    if (!maxDayjs) return undefined;
    return dayjsToCalendarDate(maxDayjs, timezone);
  }, [maxDayjs, timezone]);

  const [draftStartText, setDraftStartText] = useState(committedStartText);
  const [draftEndText, setDraftEndText] = useState(committedEndText);
  const [draftStart, setDraftStart] = useState<Dayjs | null>(committedStart);
  const [draftEnd, setDraftEnd] = useState<Dayjs | null>(committedEnd);
  const [isDraftInvalid, setIsDraftInvalid] = useState(false);

  useEffect(() => {
    if (isOpen) return;
    setDraftStartText(committedStartText);
    setDraftEndText(committedEndText);
    setDraftStart(committedStart);
    setDraftEnd(committedEnd);
    setIsDraftInvalid(false);
  }, [committedEnd, committedEndText, committedStart, committedStartText, isOpen]);

  const validateMinMax = useCallback(
    (d: Dayjs) => {
      const candidate = hasTime ? d : d.startOf("day");
      if (minDayjs) {
        const minC = hasTime ? minDayjs : minDayjs.startOf("day");
        if (candidate.isBefore(minC)) return false;
      }
      if (maxDayjs) {
        const maxC = hasTime ? maxDayjs : maxDayjs.endOf("day");
        if (candidate.isAfter(maxC)) return false;
      }
      return true;
    },
    [hasTime, maxDayjs, minDayjs],
  );

  const commit = useCallback(() => {
    const sText = draftStartText.trim();
    const eText = draftEndText.trim();

    if (!sText && !eText) {
      setIsDraftInvalid(false);
      if (value === undefined) setUncontrolledValue(null);
      onChange?.(null);
      return true;
    }

    const s = sText ? toDayjs(sText, format, timezone) : null;
    const e = eText ? toDayjs(eText, format, timezone) : null;

    if ((sText && !s) || (eText && !e)) {
      setIsDraftInvalid(true);
      return false;
    }
    if (s && !validateMinMax(s)) {
      setIsDraftInvalid(true);
      return false;
    }
    if (e && !validateMinMax(e)) {
      setIsDraftInvalid(true);
      return false;
    }

    let start = s;
    let end = e;
    if (start && end && start.isAfter(end)) {
      [start, end] = [end, start];
    }

    const outStart = start ? formatDayjs(start, format, timezone) : null;
    const outEnd = end ? formatDayjs(end, format, timezone) : null;

    setIsDraftInvalid(false);
    const out = outStart || outEnd ? { start: outStart, end: outEnd } : null;
    if (value === undefined) setUncontrolledValue(out);
    onChange?.(out);
    return true;
  }, [
    draftEndText,
    draftStartText,
    format,
    onChange,
    timezone,
    validateMinMax,
    value,
  ]);

  const close = useCallback(() => setIsOpen(false), []);
  const commitAndClose = useCallback(() => {
    commit();
    close();
  }, [close, commit]);

  const open = useCallback(() => {
    if (isDisabled) return;
    setIsOpen(true);
    requestAnimationFrame(() => startRef.current?.focus());
  }, [isDisabled]);

  const handleOpenChange = useCallback(
    (openState: boolean) => {
      if (isDisabled) return;
      if (!openState) {
        commitAndClose();
        return;
      }
      open();
    },
    [commitAndClose, isDisabled, open],
  );

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (isDisabled) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) open();
      else commitAndClose();
    }
  };

  const handleInputClick: React.MouseEventHandler<HTMLInputElement> = (e) => {
    onClick?.(e);
    if (isDisabled) return;
    if (!isOpen) open();
  };

  const updateDraftFromText = useCallback(
    (nextStartText: string, nextEndText: string) => {
      const s = nextStartText.trim()
        ? toDayjs(nextStartText, format, timezone)
        : null;
      const e = nextEndText.trim() ? toDayjs(nextEndText, format, timezone) : null;
      setDraftStart(s);
      setDraftEnd(e);

      const invalid =
        (nextStartText.trim() && !s) ||
        (nextEndText.trim() && !e) ||
        (s ? !validateMinMax(s) : false) ||
        (e ? !validateMinMax(e) : false);
      setIsDraftInvalid(invalid);
    },
    [format, timezone, validateMinMax],
  );

  const handleStartChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.value;
    setDraftStartText(next);
    updateDraftFromText(next, draftEndText);
  };
  const handleEndChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.value;
    setDraftEndText(next);
    updateDraftFromText(draftStartText, next);
  };

  const handleRangeCalendarChange = useCallback(
    (val: RangeValue<DateValue> | null) => {
      if (!val?.start || !val?.end) {
        setDraftStart(null);
        setDraftEnd(null);
        setDraftStartText("");
        setDraftEndText("");
        setIsDraftInvalid(false);
        return;
      }
      const s = calendarDateToDayjs(val.start, timezone);
      const e = calendarDateToDayjs(val.end, timezone);
      setDraftStart(s);
      setDraftEnd(e);
      setDraftStartText(formatDayjs(s, format, timezone));
      setDraftEndText(formatDayjs(e, format, timezone));
      setIsDraftInvalid(false);
    },
    [format, timezone],
  );

  const selectedValue = useMemo(() => {
    if (!draftStart || !draftEnd) return null;
    return {
      start: dayjsToCalendarDate(draftStart, timezone),
      end: dayjsToCalendarDate(draftEnd, timezone),
    };
  }, [draftEnd, draftStart, timezone]);

  const now = useMemo(() => nowInTz(timezone), [timezone]);
  const presetList = useMemo(
    () => presets ?? defaultPresets(timezone),
    [presets, timezone],
  );

  const content = (
    <div className="flex gap-3 p-2">
      <div className="flex w-48 flex-col gap-1">
        {presetList.map((p) => (
          <Button
            key={p.key}
            className="justify-start"
            size="sm"
            variant="light"
            onPress={() => {
              const r = p.range(now);
              setDraftStart(r.start);
              setDraftEnd(r.end);
              setDraftStartText(formatDayjs(r.start, format, timezone));
              setDraftEndText(formatDayjs(r.end, format, timezone));
              setIsDraftInvalid(false);
            }}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <RangeCalendar
        showHelper={false}
        value={selectedValue}
        minValue={minValue}
        maxValue={maxValue}
        onChange={handleRangeCalendarChange}
      />
    </div>
  );

  const renderedContent = dropdownRenderer
    ? dropdownRenderer({ content, close: commitAndClose, isOpen })
    : content;

  return (
    <Popover isOpen={isOpen} onOpenChange={handleOpenChange} placement="bottom">
      <PopoverTrigger>
        <div className={clsx("w-full", className)}>
          <div className="flex gap-2">
            <IBaseInput
              {...rest}
              ref={startRef}
              label={label}
              errorMessage={errorMessage}
              isInvalid={isInvalid || isDraftInvalid}
              isDisabled={isDisabled}
              value={draftStartText}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              onChange={handleStartChange}
            />
            <IBaseInput
              {...rest}
              ref={endRef}
              label={typeof label === "string" ? " " : undefined}
              isInvalid={isInvalid || isDraftInvalid}
              isDisabled={isDisabled}
              value={draftEndText}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              onChange={handleEndChange}
              endContent={
                endContent ?? (
                  <CalendarIcon
                    aria-hidden="true"
                    className="text-default-400"
                    size={16}
                  />
                )
              }
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0">{renderedContent}</PopoverContent>
    </Popover>
  );
}


