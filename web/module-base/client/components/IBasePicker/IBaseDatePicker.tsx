"use client";

import type { InputProps } from "@heroui/input";
import type { DateValue } from "@react-types/calendar";
import type { Dayjs } from "dayjs";

import { Calendar } from "@heroui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import clsx from "clsx";
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

import ButtonFastChoose from "./components/ButtonFastChoose";

export type IBaseDatePickerValue = string | Dayjs | null;

type CalendarPassThroughProps = Omit<
  React.ComponentProps<typeof Calendar>,
  | "value"
  | "minValue"
  | "maxValue"
  | "onChange"
  | "bottomContent"
  | "showHelper"
>;

export type IBaseDatePickerQuickSelect =
  | false
  | {
      label: React.ReactNode;
      getValue: (now: Dayjs) => Dayjs;
    };

export interface IBaseDatePickerProps extends Omit<
  InputProps,
  "value" | "defaultValue" | "onChange" | "onValueChange" | "type"
> {
  value?: IBaseDatePickerValue;
  defaultValue?: IBaseDatePickerValue;
  onChange?: (value: string | null) => void;
  /**
   * Allow clearing the current value via a clear icon.
   * - true: show clear icon (when input has value) and allow setting value to null
   * - false: hide clear icon and prevent clearing; empty input reverts to previous value
   * @default true
   */
  allowClear?: boolean;
  format?: string;
  minDate?: string | Dayjs;
  maxDate?: string | Dayjs;
  timezone?: string;
  showToday?: boolean;
  quickSelect?: IBaseDatePickerQuickSelect;
  calendarProps?: CalendarPassThroughProps;
  dropdownRenderer?: (params: {
    content: React.ReactNode;
    close: () => void;
    isOpen: boolean;
  }) => React.ReactNode;
}

const DEFAULT_FORMAT = "DD/MM/YYYY";

export function IBaseDatePicker(props: IBaseDatePickerProps) {
  const t = useTranslations("components.picker");
  const {
    value,
    defaultValue,
    onChange,
    format = DEFAULT_FORMAT,
    allowClear = true,
    minDate,
    maxDate,
    timezone = SYSTEM_TIMEZONE,
    showToday = true,
    quickSelect,
    calendarProps,
    dropdownRenderer,
    isDisabled,
    endContent,
    className,
    onKeyDown,
    onClick,
    ...rest
  } = props;

  // React Compiler will automatically optimize these computations
  const hasTime = /H|m|s/.test(format);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] =
    useState<IBaseDatePickerValue>(defaultValue ?? null);

  const committedValue: IBaseDatePickerValue =
    value !== undefined ? value : uncontrolledValue;

  const committedDayjs = toDayjs(committedValue, format, timezone);

  const committedText = !committedDayjs
    ? ""
    : formatDayjs(committedDayjs, format, timezone);

  const minDayjs = minDate ? toDayjs(minDate, format, timezone) : null;
  const maxDayjs = maxDate ? toDayjs(maxDate, format, timezone) : null;

  const minValue = !minDayjs
    ? undefined
    : dayjsToCalendarDate(minDayjs, timezone);
  const maxValue = !maxDayjs
    ? undefined
    : dayjsToCalendarDate(maxDayjs, timezone);

  // Draft state while popover is open / typing
  const [draftText, setDraftText] = useState(committedText);
  const [draftDayjs, setDraftDayjs] = useState<Dayjs | null>(committedDayjs);
  const [isDraftInvalid, setIsDraftInvalid] = useState(false);

  // Keep input text in sync with committed value when not open.
  useEffect(() => {
    if (isOpen) return;
    setDraftText(committedText);
    setDraftDayjs(committedDayjs);
    setIsDraftInvalid(false);
  }, [committedText, committedDayjs, isOpen]);

  // React Compiler will automatically optimize this callback
  const validateAgainstMinMax = (d: Dayjs) => {
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
  };

  // React Compiler will automatically optimize this callback
  const commit = () => {
    const text = draftText.trim();

    if (!text) {
      if (!allowClear) {
        // Prevent clearing: revert to last committed value
        setDraftText(committedText);
        setDraftDayjs(committedDayjs);
        setIsDraftInvalid(false);

        return true;
      }
      setIsDraftInvalid(false);

      if (value === undefined) setUncontrolledValue(null);
      onChange?.(null);

      return true;
    }

    const parsed = toDayjs(text, format, timezone);

    if (!parsed) {
      setIsDraftInvalid(true);

      return false;
    }

    if (!validateAgainstMinMax(parsed)) {
      setIsDraftInvalid(true);

      return false;
    }

    const out = formatDayjs(parsed, format, timezone);

    setIsDraftInvalid(false);

    if (value === undefined) setUncontrolledValue(out);
    onChange?.(out);

    return true;
  };

  // React Compiler will automatically optimize these callbacks
  const close = () => {
    setIsOpen(false);
  };

  const commitAndClose = () => {
    commit();
    close();
  };

  const open = () => {
    if (isDisabled) return;

    setIsOpen(true);
    // focus input for immediate typing
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleOpenChange = (openState: boolean) => {
    if (isDisabled) return;

    if (!openState) {
      commitAndClose();

      return;
    }

    open();
  };

  const handleInputClick: React.MouseEventHandler<HTMLInputElement> = (e) => {
    onClick?.(e);
    if (isDisabled) return;

    // Open popover on click if not already open
    if (!isOpen) {
      open();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (isDisabled) return;

    if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) {
        open();
      } else {
        commitAndClose();
      }
    }
  };

  const handleTextChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const next = e.target.value;

    setDraftText(next);

    const parsed = toDayjs(next, format, timezone);

    if (!next.trim()) {
      if (!allowClear) {
        // Prevent clearing: revert to last committed value
        setDraftText(committedText);
        setDraftDayjs(committedDayjs);
        setIsDraftInvalid(false);

        return;
      }
      setDraftDayjs(null);
      setIsDraftInvalid(false);

      return;
    }

    if (!parsed) {
      setDraftDayjs(null);
      setIsDraftInvalid(true);

      return;
    }

    if (!validateAgainstMinMax(parsed)) {
      setDraftDayjs(parsed);
      setIsDraftInvalid(true);

      return;
    }

    setDraftDayjs(parsed);
    setIsDraftInvalid(false);
  };

  // React Compiler will automatically optimize these computations
  const today = nowInTz(timezone);
  const todayCalendarValue = dayjsToCalendarDate(today, timezone);

  // React Compiler will automatically optimize this callback
  const handleCalendarChange = (val: DateValue | null) => {
    if (!val) {
      if (!allowClear) {
        // Prevent clearing: revert to last committed value
        setDraftText(committedText);
        setDraftDayjs(committedDayjs);
        setIsDraftInvalid(false);
        close();

        return;
      }
      setDraftDayjs(null);
      setDraftText("");
      setIsDraftInvalid(false);
      setFocusedValue(todayCalendarValue);

      if (value === undefined) setUncontrolledValue(null);
      onChange?.(null);
      close();

      return;
    }
    const d = calendarDateToDayjs(val, timezone);
    const out = formatDayjs(d, format, timezone);

    setDraftDayjs(d);
    setDraftText(out);
    setIsDraftInvalid(false);
    setFocusedValue(val);

    // Apply immediately then close
    if (value === undefined) setUncontrolledValue(out);
    onChange?.(out);
    close();
  };

  // React Compiler will automatically optimize this computation
  const selectedValue = !draftDayjs
    ? null
    : dayjsToCalendarDate(draftDayjs, timezone);

  // Control the calendar focus so we can programmatically "jump" the view
  // (e.g. when clicking ButtonFastChoose).
  const [focusedValue, setFocusedValue] = useState<DateValue | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFocusedValue(selectedValue ?? todayCalendarValue);
  }, [isOpen, selectedValue, todayCalendarValue]);

  const resolvedQuickSelect: Exclude<IBaseDatePickerQuickSelect, false> | null =
    useMemo(() => {
      if (quickSelect === false) return null;
      if (quickSelect) return quickSelect;
      if (!showToday) return null;

      return {
        label: t("date.quickToday"),
        getValue: (now) => (hasTime ? now : now.startOf("day")),
      };
    }, [hasTime, quickSelect, showToday, t]);

  const content = (
    <div className="flex flex-col gap-2 ">
      <Calendar
        {...calendarProps}
        bottomContent={
          resolvedQuickSelect ? (
            <ButtonFastChoose
              label={resolvedQuickSelect.label}
              onPress={() => {
                const d = resolvedQuickSelect.getValue(today);
                const out = formatDayjs(d, format, timezone);
                const nextFocus = dayjsToCalendarDate(d, timezone);

                setDraftDayjs(d);
                setDraftText(out);
                setIsDraftInvalid(false);
                setFocusedValue(nextFocus);
                // If consumer provided controlled focus handling, notify them too.
                calendarProps?.onFocusChange?.(nextFocus as any);

                // Apply immediately then close
                if (value === undefined) setUncontrolledValue(out);
                onChange?.(out);
                close();
              }}
            />
          ) : null
        }
        focusedValue={calendarProps?.focusedValue ?? focusedValue}
        maxValue={maxValue}
        minValue={minValue}
        showHelper={false}
        value={selectedValue}
        onChange={(val) => {
          handleCalendarChange(val);
          if (val) setFocusedValue(val);
        }}
        onFocusChange={(date) => {
          setFocusedValue(date);
          calendarProps?.onFocusChange?.(date);
        }}
      />
    </div>
  );

  const renderedContent = dropdownRenderer
    ? dropdownRenderer({ content, close: commitAndClose, isOpen })
    : content;

  const showClearIcon = allowClear && Boolean(draftText.trim());
  const resolvedPlaceholder = useMemo(() => {
    if (rest.placeholder) return rest.placeholder;

    return hasTime
      ? t("date.placeholderDateTime", { format })
      : t("date.placeholder", { format });
  }, [format, hasTime, rest.placeholder, t]);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isDisabled) return;

    setDraftText("");
    setDraftDayjs(null);
    setIsDraftInvalid(false);
    setFocusedValue(todayCalendarValue);

    if (value === undefined) setUncontrolledValue(null);
    onChange?.(null);
    close();

    requestAnimationFrame(() => inputRef.current?.focus());
  };

  return (
    <Popover
      classNames={{
        // Prevent HeroUI Popover trigger from shrinking/fading when open
        trigger: "aria-expanded:!scale-100 aria-expanded:!opacity-100",
      }}
      isOpen={isOpen}
      placement="bottom"
      onOpenChange={handleOpenChange}
    >
      <PopoverTrigger>
        <div className={clsx("w-full", className)}>
          <IBaseInput
            {...rest}
            ref={inputRef}
            endContent={
              <div className="flex items-center gap-1 cursor-pointer">
                {showClearIcon ? (
                  <button
                    aria-label={t("date.clearAriaLabel")}
                    className="cursor-pointer rounded-small p-1 text-default-400 transition-colors hover:text-danger-500"
                    type="button"
                    onClick={handleClear}
                    onMouseDown={(e) => {
                      // keep input focused
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
            isInvalid={rest.isInvalid || isDraftInvalid}
            placeholder={resolvedPlaceholder}
            value={draftText}
            onChange={handleTextChange}
            onClick={handleInputClick}
            onKeyDown={handleKeyDown}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-0">{renderedContent}</PopoverContent>
    </Popover>
  );
}
export default IBaseDatePicker;
