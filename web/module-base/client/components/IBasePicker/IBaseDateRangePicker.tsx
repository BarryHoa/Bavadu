"use client";

import IBaseInput from "@base/client/components/IBaseInput";
import { SYSTEM_TIMEZONE } from "@base/shared/constants";
import { Button } from "@heroui/button";
import { RangeCalendar } from "@heroui/calendar";
import type { InputProps } from "@heroui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import type { DateValue } from "@react-types/calendar";
import type { RangeValue } from "@react-types/shared";
import clsx from "clsx";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { Dayjs } from "dayjs";
import {
  calendarDateToDayjs,
  dayjsToCalendarDate,
  formatDayjs,
  nowInTz,
  toDayjs,
  type DateLike,
} from "../../utils/date/parseDateInput";

export type IBaseDateRangePickerValue = {
  start: string | Dayjs | null;
  end: string | Dayjs | null;
} | null;

export interface RangePreset {
  key: string;
  label: React.ReactNode;
  range: (now: Dayjs) => { start: Dayjs; end: Dayjs };
}

export interface IBaseDateRangePickerProps extends Omit<
  InputProps,
  | "value"
  | "defaultValue"
  | "onChange"
  | "onValueChange"
  | "type"
  | "startContent"
> {
  value?: IBaseDateRangePickerValue;
  defaultValue?: IBaseDateRangePickerValue;
  onChange?: (
    value: { start: string | null; end: string | null } | null
  ) => void;
  startPlaceholder?: string;
  endPlaceholder?: string;
  /**
   * Allow clearing the current value via clear icons.
   * - true: allow clearing both start/end
   * - false: prevent clearing both start/end (empty input reverts)
   * - [start, end]: allow clearing start/end individually
   * @default true
   */
  allowClear?: boolean | [boolean, boolean];
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

const DEFAULT_FORMAT = "DD/MM/YYYY";

function defaultPresets(
  tz: string,
  labels: {
    today: React.ReactNode;
    thisWeek: React.ReactNode;
    lastWeek: React.ReactNode;
    thisMonth: React.ReactNode;
    lastMonth: React.ReactNode;
    last3Months: React.ReactNode;
    last6Months: React.ReactNode;
    thisYear: React.ReactNode;
    lastYear: React.ReactNode;
    last2Years: React.ReactNode;
    last3Years: React.ReactNode;
    last5Years: React.ReactNode;
  }
): RangePreset[] {
  const presets: RangePreset[] = [
    {
      key: "today",
      label: labels.today,
      range: (now) => ({
        start: now.startOf("day"),
        end: now.endOf("day"),
      }),
    },
    {
      key: "this_week",
      label: labels.thisWeek,
      range: (now) => ({
        start: now.startOf("isoWeek"),
        end: now.endOf("isoWeek"),
      }),
    },
    {
      key: "last_week",
      label: labels.lastWeek,
      range: (now) => {
        const n = now.subtract(1, "week");
        return { start: n.startOf("isoWeek"), end: n.endOf("isoWeek") };
      },
    },
    {
      key: "this_month",
      label: labels.thisMonth,
      range: (now) => ({
        start: now.startOf("month"),
        end: now.endOf("month"),
      }),
    },
    {
      key: "last_month",
      label: labels.lastMonth,
      range: (now) => {
        const n = now.subtract(1, "month");
        return { start: n.startOf("month"), end: n.endOf("month") };
      },
    },
    {
      key: "last_3_months",
      label: labels.last3Months,
      range: (now) => ({
        start: now.subtract(2, "month").startOf("month"),
        end: now.endOf("month"),
      }),
    },
    {
      key: "last_6_months",
      label: labels.last6Months,
      range: (now) => ({
        start: now.subtract(5, "month").startOf("month"),
        end: now.endOf("month"),
      }),
    },
    {
      key: "this_year",
      label: labels.thisYear,
      range: (now) => ({ start: now.startOf("year"), end: now.endOf("year") }),
    },
    {
      key: "last_year",
      label: labels.lastYear,
      range: (now) => {
        const n = now.subtract(1, "year");
        return { start: n.startOf("year"), end: n.endOf("year") };
      },
    },
    {
      key: "last_2_years",
      label: labels.last2Years,
      range: (now) => ({
        start: now.subtract(1, "year").startOf("year"),
        end: now.endOf("year"),
      }),
    },
    {
      key: "last_3_years",
      label: labels.last3Years,
      range: (now) => ({
        start: now.subtract(2, "year").startOf("year"),
        end: now.endOf("year"),
      }),
    },
    {
      key: "last_5_years",
      label: labels.last5Years,
      range: (now) => ({
        start: now.subtract(4, "year").startOf("year"),
        end: now.endOf("year"),
      }),
    },
  ];

  return presets.map((p) => ({
    ...p,
    range: (now: Dayjs) => {
      const n = now.tz(tz);
      return p.range(n);
    },
  }));
}

function toDayjsSafe(
  value: DateLike,
  format: string,
  tz: string
): Dayjs | null {
  return toDayjs(value, format, tz);
}

export default function IBaseDateRangePicker(props: IBaseDateRangePickerProps) {
  const t = useTranslations("components.picker");
  const {
    value,
    defaultValue,
    onChange,
    placeholder,
    startPlaceholder,
    endPlaceholder,
    allowClear = true,
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

  const [allowClearStart, allowClearEnd] = useMemo(() => {
    if (Array.isArray(allowClear)) return allowClear;
    return [allowClear, allowClear] as const;
  }, [allowClear]);

  const hasTime = useMemo(() => /H|m|s/.test(format), [format]);
  const resolvedStartPlaceholder = useMemo(() => {
    if (startPlaceholder) return startPlaceholder;
    if (placeholder) return placeholder;
    return hasTime
      ? t("range.startPlaceholderDateTime", { format })
      : t("range.startPlaceholder", { format });
  }, [format, hasTime, placeholder, startPlaceholder, t]);
  const resolvedEndPlaceholder = useMemo(() => {
    if (endPlaceholder) return endPlaceholder;
    if (placeholder) return placeholder;
    return hasTime
      ? t("range.endPlaceholderDateTime", { format })
      : t("range.endPlaceholder", { format });
  }, [endPlaceholder, format, hasTime, placeholder, t]);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] =
    useState<IBaseDateRangePickerValue>(defaultValue ?? null);

  const committedValue: IBaseDateRangePickerValue =
    value !== undefined ? value : uncontrolledValue;

  const committedStart = useMemo(
    () => toDayjsSafe(committedValue?.start, format, timezone),
    [committedValue?.start, format, timezone]
  );
  const committedEnd = useMemo(
    () => toDayjsSafe(committedValue?.end, format, timezone),
    [committedValue?.end, format, timezone]
  );

  const committedStartText = useMemo(
    () => (committedStart ? formatDayjs(committedStart, format, timezone) : ""),
    [committedStart, format, timezone]
  );
  const committedEndText = useMemo(
    () => (committedEnd ? formatDayjs(committedEnd, format, timezone) : ""),
    [committedEnd, format, timezone]
  );

  const minDayjs = useMemo(
    () => (minDate ? toDayjs(minDate, format, timezone) : null),
    [minDate, format, timezone]
  );
  const maxDayjs = useMemo(
    () => (maxDate ? toDayjs(maxDate, format, timezone) : null),
    [maxDate, format, timezone]
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
  }, [
    committedEnd,
    committedEndText,
    committedStart,
    committedStartText,
    isOpen,
  ]);

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
    [hasTime, maxDayjs, minDayjs]
  );

  const commit = useCallback(() => {
    const sText = draftStartText.trim();
    const eText = draftEndText.trim();

    if (!sText && !eText) {
      if (!allowClearStart && committedStartText) {
        setDraftStartText(committedStartText);
        setDraftStart(committedStart);
      }
      if (!allowClearEnd && committedEndText) {
        setDraftEndText(committedEndText);
        setDraftEnd(committedEnd);
      }
      if (!allowClearStart || !allowClearEnd) {
        setIsDraftInvalid(false);
        return true;
      }
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
    allowClearEnd,
    allowClearStart,
    committedEnd,
    committedEndText,
    committedStart,
    committedStartText,
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
    [commitAndClose, isDisabled, open]
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
      const e = nextEndText.trim()
        ? toDayjs(nextEndText, format, timezone)
        : null;
      setDraftStart(s);
      setDraftEnd(e);

      const invalid =
        (nextStartText.trim() && !s) ||
        (nextEndText.trim() && !e) ||
        (s ? !validateMinMax(s) : false) ||
        (e ? !validateMinMax(e) : false);
      setIsDraftInvalid(invalid);
    },
    [format, timezone, validateMinMax]
  );

  const handleStartChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.value;
    if (!allowClearStart && !next.trim()) {
      setDraftStartText(committedStartText);
      setDraftStart(committedStart);
      setIsDraftInvalid(false);
      return;
    }
    setDraftStartText(next);
    updateDraftFromText(next, draftEndText);
  };
  const handleEndChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.value;
    if (!allowClearEnd && !next.trim()) {
      setDraftEndText(committedEndText);
      setDraftEnd(committedEnd);
      setIsDraftInvalid(false);
      return;
    }
    setDraftEndText(next);
    updateDraftFromText(draftStartText, next);
  };

  const handleRangeCalendarChange = useCallback(
    (val: RangeValue<DateValue> | null) => {
      if (!val?.start || !val?.end) {
        if (!allowClearStart) {
          setDraftStart(committedStart);
          setDraftStartText(committedStartText);
        } else {
          setDraftStart(null);
          setDraftStartText("");
        }
        if (!allowClearEnd) {
          setDraftEnd(committedEnd);
          setDraftEndText(committedEndText);
        } else {
          setDraftEnd(null);
          setDraftEndText("");
        }
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
    [
      allowClearEnd,
      allowClearStart,
      committedEnd,
      committedEndText,
      committedStart,
      committedStartText,
      format,
      timezone,
    ]
  );

  const handleClearStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDisabled) return;
      if (!allowClearStart) return;

      setDraftStart(null);
      setDraftStartText("");
      setIsDraftInvalid(false);

      const outEnd = draftEndText.trim() ? draftEndText.trim() : null;
      const out =
        outEnd != null ? ({ start: null, end: outEnd } as const) : null;

      if (value === undefined) setUncontrolledValue(out);
      onChange?.(out);
      close();
    },
    [allowClearStart, close, draftEndText, isDisabled, onChange, value]
  );

  const handleClearEnd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDisabled) return;
      if (!allowClearEnd) return;

      setDraftEnd(null);
      setDraftEndText("");
      setIsDraftInvalid(false);

      const outStart = draftStartText.trim() ? draftStartText.trim() : null;
      const out =
        outStart != null ? ({ start: outStart, end: null } as const) : null;

      if (value === undefined) setUncontrolledValue(out);
      onChange?.(out);
      close();
    },
    [allowClearEnd, close, draftStartText, isDisabled, onChange, value]
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
    () =>
      presets ??
      defaultPresets(timezone, {
        today: t("presets.today"),
        thisWeek: t("presets.thisWeek"),
        lastWeek: t("presets.lastWeek"),
        thisMonth: t("presets.thisMonth"),
        lastMonth: t("presets.lastMonth"),
        last3Months: t("presets.last3Months"),
        last6Months: t("presets.last6Months"),
        thisYear: t("presets.thisYear"),
        lastYear: t("presets.lastYear"),
        last2Years: t("presets.last2Years"),
        last3Years: t("presets.last3Years"),
        last5Years: t("presets.last5Years"),
      }),
    [presets, t, timezone]
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
    <Popover
      isOpen={isOpen}
      placement="bottom"
      classNames={{
        // Prevent HeroUI Popover trigger from shrinking/fading when open
        trigger: "aria-expanded:!scale-100 aria-expanded:!opacity-100",
      }}
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger>
        <div className={clsx("w-full", className)}>
          <div className="flex gap-2">
            <IBaseInput
              {...rest}
              ref={startRef}
              label={label}
              placeholder={resolvedStartPlaceholder}
              errorMessage={errorMessage}
              isInvalid={isInvalid || isDraftInvalid}
              isDisabled={isDisabled}
              value={draftStartText}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              onChange={handleStartChange}
              endContent={
                <div className="flex items-center gap-1 cursor-pointer">
                  {allowClearStart && draftStartText.trim() ? (
                    <button
                      aria-label={t("range.clearStartAriaLabel")}
                      className="cursor-pointer rounded-small p-1 text-default-400 transition-colors hover:text-danger-500"
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={handleClearStart}
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                  <CalendarIcon
                    aria-hidden="true"
                    className="text-default-400"
                    size={16}
                  />
                </div>
              }
            />
            <IBaseInput
              {...rest}
              ref={endRef}
              label={typeof label === "string" ? " " : undefined}
              placeholder={resolvedEndPlaceholder}
              isInvalid={isInvalid || isDraftInvalid}
              isDisabled={isDisabled}
              value={draftEndText}
              onKeyDown={handleKeyDown}
              onClick={handleInputClick}
              onChange={handleEndChange}
              endContent={
                <div className="flex items-center gap-1 cursor-pointer">
                  {allowClearEnd && draftEndText.trim() ? (
                    <button
                      aria-label={t("range.clearEndAriaLabel")}
                      className="cursor-pointer rounded-small p-1 text-default-400 transition-colors hover:text-danger-500"
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={handleClearEnd}
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                  {endContent ?? (
                    <CalendarIcon
                      aria-hidden="true"
                      className="text-default-400"
                      size={16}
                    />
                  )}
                </div>
              }
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0">{renderedContent}</PopoverContent>
    </Popover>
  );
}
