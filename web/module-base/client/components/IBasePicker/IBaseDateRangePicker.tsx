"use client";

import type { DateValue } from "@react-types/calendar";
import type { RangeValue } from "@react-types/shared";
import type { Dayjs } from "dayjs";

import { Button } from "@heroui/button";
import { RangeCalendar } from "@heroui/calendar";
import { InputProps } from "@heroui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useEffect, useMemo, useRef, useState } from "react";

import IBaseInput from "@base/client/components/IBaseInput";
import { SYSTEM_TIMEZONE } from "@base/shared/constants";

import {
  calendarDateToDayjs,
  dayjsToCalendarDate,
  formatDayjs,
  nowInTz,
  toDayjs,
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
      range: (now) => ({ start: now.startOf("day"), end: now.endOf("day") }),
    },
    {
      key: "this-week",
      label: labels.thisWeek,
      range: (now) => ({ start: now.startOf("week"), end: now.endOf("week") }),
    },
    {
      key: "last-week",
      label: labels.lastWeek,
      range: (now) => {
        const start = now.subtract(1, "week").startOf("week");

        return { start, end: start.endOf("week") };
      },
    },
    {
      key: "this-month",
      label: labels.thisMonth,
      range: (now) => ({
        start: now.startOf("month"),
        end: now.endOf("month"),
      }),
    },
    {
      key: "last-month",
      label: labels.lastMonth,
      range: (now) => {
        const start = now.subtract(1, "month").startOf("month");

        return { start, end: start.endOf("month") };
      },
    },
    {
      key: "last-3-months",
      label: labels.last3Months,
      range: (now) => ({
        start: now.subtract(3, "month").startOf("month"),
        end: now.endOf("month"),
      }),
    },
    {
      key: "last-6-months",
      label: labels.last6Months,
      range: (now) => ({
        start: now.subtract(6, "month").startOf("month"),
        end: now.endOf("month"),
      }),
    },
    {
      key: "this-year",
      label: labels.thisYear,
      range: (now) => ({ start: now.startOf("year"), end: now.endOf("year") }),
    },
    {
      key: "last-year",
      label: labels.lastYear,
      range: (now) => {
        const start = now.subtract(1, "year").startOf("year");

        return { start, end: start.endOf("year") };
      },
    },
    {
      key: "last-2-years",
      label: labels.last2Years,
      range: (now) => ({
        start: now.subtract(2, "year").startOf("year"),
        end: now.endOf("year"),
      }),
    },
    {
      key: "last-3-years",
      label: labels.last3Years,
      range: (now) => ({
        start: now.subtract(3, "year").startOf("year"),
        end: now.endOf("year"),
      }),
    },
    {
      key: "last-5-years",
      label: labels.last5Years,
      range: (now) => ({
        start: now.subtract(5, "year").startOf("year"),
        end: now.endOf("year"),
      }),
    },
  ];

  return presets;
}

export function IBaseDateRangePicker(props: IBaseDateRangePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    format = DEFAULT_FORMAT,
    startPlaceholder,
    endPlaceholder,
    timezone = SYSTEM_TIMEZONE,
    minDate,
    maxDate,
    allowClear = true,
    presets: customPresets,
    dropdownRenderer,
    label,
    errorMessage,
    isInvalid,
    isDisabled,
    endContent,
    ...rest
  } = props;

  const t = useTranslations("components.dateRangePicker");

  const [isOpen, setIsOpen] = useState(false);
  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  // --- Initial value logic ---
  const initialValue = useMemo(() => {
    const v = value !== undefined ? value : defaultValue;

    if (!v) return { start: null, end: null };

    return {
      start: toDayjs(v.start, timezone),
      end: toDayjs(v.end, timezone),
    };
  }, [value, defaultValue, timezone]);

  const [selectedRange, setSelectedRange] = useState<{
    start: Dayjs | null;
    end: Dayjs | null;
  }>(initialValue);

  // Local text state for inputs
  const [draftStartText, setDraftStartText] = useState("");
  const [draftEndText, setDraftEndText] = useState("");

  const [isDraftInvalid, setIsDraftInvalid] = useState(false);

  // Sync draft text with selectedRange
  useEffect(() => {
    setDraftStartText(
      selectedRange.start ? formatDayjs(selectedRange.start, format) : ""
    );
    setDraftEndText(
      selectedRange.end ? formatDayjs(selectedRange.end, format) : ""
    );
    setIsDraftInvalid(false);
  }, [selectedRange, format]);

  // Sync when controlled value changes
  useEffect(() => {
    if (value !== undefined) {
      const v = value || { start: null, end: null };

      setSelectedRange({
        start: toDayjs(v.start, timezone),
        end: toDayjs(v.end, timezone),
      });
    }
  }, [value, timezone]);

  const resolvedStartPlaceholder = startPlaceholder || t("range.startLabel");
  const resolvedEndPlaceholder = endPlaceholder || t("range.endLabel");

  const presets = useMemo(() => {
    if (customPresets) return customPresets;

    return defaultPresets(timezone, {
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
    });
  }, [customPresets, timezone, t]);

  const minCalendarDate = useMemo(() => {
    const d = toDayjs(minDate, timezone);

    return d ? dayjsToCalendarDate(d) : undefined;
  }, [minDate, timezone]);
  const maxCalendarDate = useMemo(() => {
    const d = toDayjs(maxDate, timezone);

    return d ? dayjsToCalendarDate(d) : undefined;
  }, [maxDate, timezone]);

  const heroRangeValue: RangeValue<DateValue> | null = useMemo(() => {
    if (selectedRange.start && selectedRange.end) {
      return {
        start: dayjsToCalendarDate(selectedRange.start),
        end: dayjsToCalendarDate(selectedRange.end),
      };
    }

    return null;
  }, [selectedRange]);

  const handleRangeChange = (range: RangeValue<DateValue> | null) => {
    if (!range) {
      const newVal = { start: null, end: null };

      setSelectedRange(newVal);
      onChange?.(newVal);
    } else {
      const start = calendarDateToDayjs(range.start, timezone).startOf("day");
      const end = calendarDateToDayjs(range.end, timezone).endOf("day");
      const newVal = { start, end };

      setSelectedRange(newVal);
      onChange?.({
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }
  };

  const handlePresetClick = (preset: RangePreset) => {
    const now = nowInTz(timezone);
    const { start, end } = preset.range(now);
    const newVal = { start, end };

    setSelectedRange(newVal);
    onChange?.({
      start: start.toISOString(),
      end: end.toISOString(),
    });
    setIsOpen(false);
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    setDraftStartText(val);
    const d = toDayjs(val, timezone, format);

    if (d && d.isValid()) {
      const newStart = d.startOf("day");

      setSelectedRange((prev) => {
        const newVal = { ...prev, start: newStart };

        if (newVal.start && newVal.end && newVal.start.isAfter(newVal.end)) {
          newVal.end = newVal.start.endOf("day");
        }
        onChange?.({
          start: newVal.start?.toISOString() || null,
          end: newVal.end?.toISOString() || null,
        });

        return newVal;
      });
      setIsDraftInvalid(false);
    } else {
      setIsDraftInvalid(val.length > 0);
    }
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    setDraftEndText(val);
    const d = toDayjs(val, timezone, format);

    if (d && d.isValid()) {
      const newEnd = d.endOf("day");

      setSelectedRange((prev) => {
        const newVal = { ...prev, end: newEnd };

        if (newVal.start && newVal.end && newVal.end.isBefore(newVal.start)) {
          newVal.start = newVal.end.startOf("day");
        }
        onChange?.({
          start: newVal.start?.toISOString() || null,
          end: newVal.end?.toISOString() || null,
        });

        return newVal;
      });
      setIsDraftInvalid(false);
    } else {
      setIsDraftInvalid(val.length > 0);
    }
  };

  const handleClearStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVal = { ...selectedRange, start: null };

    setSelectedRange(newVal);
    onChange?.({
      start: null,
      end: newVal.end?.toISOString() || null,
    });
  };

  const handleClearEnd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVal = { ...selectedRange, end: null };

    setSelectedRange(newVal);
    onChange?.({
      start: newVal.start?.toISOString() || null,
      end: null,
    });
  };

  const handleInputClick = () => {
    if (!isDisabled) setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      setIsOpen(true);
    }
  };

  const allowClearStart = Array.isArray(allowClear)
    ? allowClear[0]
    : allowClear;
  const allowClearEnd = Array.isArray(allowClear) ? allowClear[1] : allowClear;

  const renderedContent = (
    <div className="flex flex-col sm:flex-row bg-content1 shadow-medium rounded-medium overflow-hidden">
      {/* Presets Sidebar */}
      {presets.length > 0 && (
        <div className="flex flex-col gap-1 p-2 border-r border-divider min-w-[160px] bg-default-50">
          <p className="px-2 py-1 text-tiny font-bold text-default-400 uppercase tracking-wider">
            {t("presets.title")}
          </p>
          {presets.map((p) => (
            <Button
              key={p.key}
              fullWidth
              className="justify-start h-8 text-small font-normal hover:bg-default-100"
              size="sm"
              variant="light"
              onPress={() => handlePresetClick(p)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      )}

      {/* Calendar Area */}
      <div className="p-3">
        <RangeCalendar
          aria-label={t("range.calendarAriaLabel")}
          maxValue={maxCalendarDate}
          minValue={minCalendarDate}
          value={heroRangeValue}
          onChange={handleRangeChange}
        />
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-divider pt-3">
          <div className="flex flex-col">
            <span className="text-tiny text-default-400">
              {t("range.selectedLabel")}
            </span>
            <span className="text-small font-medium">
              {selectedRange.start
                ? formatDayjs(selectedRange.start, format)
                : "---"}{" "}
              -{" "}
              {selectedRange.end
                ? formatDayjs(selectedRange.end, format)
                : "---"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="flat"
              onPress={() => {
                const newVal = { start: null, end: null };

                setSelectedRange(newVal);
                onChange?.(newVal);
                setIsOpen(false);
              }}
            >
              {t("actions.clear")}
            </Button>
            <Button color="primary" size="sm" onPress={() => setIsOpen(false)}>
              {t("actions.close")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Popover isOpen={isOpen} placement="bottom-start" onOpenChange={setIsOpen}>
      <PopoverTrigger>
        <div className="flex flex-col gap-1.5 w-full">
          {label && (
            <label className="text-small font-medium text-default-600">
              {label}
            </label>
          )}
          <div className="flex items-center gap-2">
            <IBaseInput
              {...rest}
              ref={startRef}
              endContent={
                <div className="flex items-center gap-1 cursor-pointer">
                  {allowClearStart && draftStartText.trim() ? (
                    <button
                      aria-label={t("range.clearStartAriaLabel")}
                      className="cursor-pointer rounded-small p-1 text-default-400 transition-colors hover:text-danger-500"
                      type="button"
                      onClick={handleClearStart}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
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
              errorMessage={errorMessage}
              isDisabled={isDisabled}
              isInvalid={isInvalid || isDraftInvalid}
              placeholder={resolvedStartPlaceholder}
              value={draftStartText}
              onChange={handleStartChange}
              onClick={handleInputClick}
              onKeyDown={handleKeyDown}
            />
            <div className="text-default-400">
              <span className="px-1">—</span>
            </div>
            <IBaseInput
              {...rest}
              ref={endRef}
              endContent={
                <div className="flex items-center gap-1 cursor-pointer">
                  {allowClearEnd && draftEndText.trim() ? (
                    <button
                      aria-label={t("range.clearEndAriaLabel")}
                      className="cursor-pointer rounded-small p-1 text-default-400 transition-colors hover:text-danger-500"
                      type="button"
                      onClick={handleClearEnd}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
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
              isDisabled={isDisabled}
              isInvalid={isInvalid || isDraftInvalid}
              placeholder={resolvedEndPlaceholder}
              value={draftEndText}
              onChange={handleEndChange}
              onClick={handleInputClick}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        {dropdownRenderer
          ? dropdownRenderer({
              content: renderedContent,
              close: () => setIsOpen(false),
              isOpen,
            })
          : renderedContent}
      </PopoverContent>
    </Popover>
  );
}
export default IBaseDateRangePicker;
