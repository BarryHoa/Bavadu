"use client";

import type { InputProps } from "@heroui/input";
import type { DateValue } from "@react-types/calendar";
import type { Dayjs } from "dayjs";

import IBaseInput from "@base/client/components/IBaseInput";
import { SYSTEM_TIMEZONE } from "@base/shared/constants";
import { Calendar } from "@heroui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
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

export default function IBaseDatePicker(props: IBaseDatePickerProps) {
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

  const hasTime = useMemo(() => /H|m|s/.test(format), [format]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] =
    useState<IBaseDatePickerValue>(defaultValue ?? null);

  const committedValue: IBaseDatePickerValue =
    value !== undefined ? value : uncontrolledValue;

  const committedDayjs = useMemo(
    () => toDayjs(committedValue, format, timezone),
    [committedValue, format, timezone]
  );

  const committedText = useMemo(() => {
    if (!committedDayjs) return "";

    return formatDayjs(committedDayjs, format, timezone);
  }, [committedDayjs, format, timezone]);

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

  const validateAgainstMinMax = useCallback(
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
  }, [
    allowClear,
    committedDayjs,
    committedText,
    draftText,
    format,
    onChange,
    timezone,
    validateAgainstMinMax,
    value,
  ]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const commitAndClose = useCallback(() => {
    commit();
    close();
  }, [close, commit]);

  const open = useCallback(() => {
    if (isDisabled) return;

    setIsOpen(true);
    // focus input for immediate typing
    requestAnimationFrame(() => inputRef.current?.focus());
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

  const today = useMemo(() => nowInTz(timezone), [timezone]);
  const todayCalendarValue = useMemo(
    () => dayjsToCalendarDate(today, timezone),
    [today, timezone]
  );

  const handleCalendarChange = useCallback(
    (val: DateValue | null) => {
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
    },
    [
      allowClear,
      close,
      committedDayjs,
      committedText,
      format,
      onChange,
      timezone,
      todayCalendarValue,
      value,
    ]
  );

  const selectedValue = useMemo(() => {
    if (!draftDayjs) return null;

    return dayjsToCalendarDate(draftDayjs, timezone);
  }, [draftDayjs, timezone]);

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
        focusedValue={calendarProps?.focusedValue ?? focusedValue}
        onFocusChange={(date) => {
          setFocusedValue(date);
          calendarProps?.onFocusChange?.(date);
        }}
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
        maxValue={maxValue}
        minValue={minValue}
        showHelper={false}
        value={selectedValue}
        onChange={(val) => {
          handleCalendarChange(val);
          if (val) setFocusedValue(val);
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

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
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
    },
    [close, isDisabled, onChange, todayCalendarValue, value]
  );

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
          <IBaseInput
            {...rest}
            ref={inputRef}
            placeholder={resolvedPlaceholder}
            endContent={
              <div className="flex items-center gap-1 cursor-pointer">
                {showClearIcon ? (
                  <button
                    aria-label={t("date.clearAriaLabel")}
                    className="cursor-pointer rounded-small p-1 text-default-400 transition-colors hover:text-danger-500"
                    type="button"
                    onMouseDown={(e) => {
                      // keep input focused
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={handleClear}
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
