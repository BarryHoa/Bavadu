"use client";

import type { InputProps } from "@heroui/input";
import type { Dayjs } from "dayjs";

import IBaseInput from "@base/client/components/IBaseInput";
import { SYSTEM_TIMEZONE } from "@base/shared/constants";
import { Button } from "@heroui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import clsx from "clsx";
import { Clock } from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { formatDayjs, nowInTz, toDayjs } from "../../utils/date/parseDateInput";

export type IBaseTimePickerValue = string | Dayjs | null;

export interface IBaseTimePickerProps extends Omit<
  InputProps,
  "value" | "defaultValue" | "onChange" | "onValueChange" | "type"
> {
  value?: IBaseTimePickerValue;
  defaultValue?: IBaseTimePickerValue;
  onChange?: (value: string | null) => void;
  format?: string; // default HH:mm
  timezone?: string;
  showNow?: boolean;
  minuteStep?: number; // default 30
}

const DEFAULT_FORMAT = "HH:mm";

function buildTimes(step: number) {
  const s = Math.max(1, Math.min(60, Math.floor(step)));
  const items: string[] = [];

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += s) {
      items.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }

  return items;
}

export default function IBaseTimePicker(props: IBaseTimePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    format = DEFAULT_FORMAT,
    timezone = SYSTEM_TIMEZONE,
    showNow = true,
    minuteStep = 30,
    isDisabled,
    endContent,
    className,
    onKeyDown,
    onClick,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const [uncontrolledValue, setUncontrolledValue] =
    useState<IBaseTimePickerValue>(defaultValue ?? null);
  const committedValue = value !== undefined ? value : uncontrolledValue;

  const committedDayjs = useMemo(
    () => toDayjs(committedValue, format, timezone),
    [committedValue, format, timezone]
  );

  const committedText = useMemo(
    () => (committedDayjs ? formatDayjs(committedDayjs, format, timezone) : ""),
    [committedDayjs, format, timezone]
  );

  const [draftText, setDraftText] = useState(committedText);
  const [isDraftInvalid, setIsDraftInvalid] = useState(false);

  useEffect(() => {
    if (isOpen) return;
    setDraftText(committedText);
    setIsDraftInvalid(false);
  }, [committedText, isOpen]);

  const commit = useCallback(() => {
    const text = draftText.trim();

    if (!text) {
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

    const out = formatDayjs(parsed, format, timezone);

    setIsDraftInvalid(false);

    if (value === undefined) setUncontrolledValue(out);
    onChange?.(out);

    return true;
  }, [draftText, format, onChange, timezone, value]);

  const close = useCallback(() => setIsOpen(false), []);
  const commitAndClose = useCallback(() => {
    commit();
    close();
  }, [close, commit]);

  const open = useCallback(() => {
    if (isDisabled) return;

    setIsOpen(true);
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

  const handleKey: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    onKeyDown?.(e);
    if (e.defaultPrevented) return;
    if (isDisabled) return;
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isOpen) open();
      else commitAndClose();
    }
  };

  const handleClick: React.MouseEventHandler<HTMLInputElement> = (e) => {
    onClick?.(e);
    if (isDisabled) return;
    if (!isOpen) open();
  };

  const times = useMemo(() => buildTimes(minuteStep), [minuteStep]);
  const now = useMemo(() => nowInTz(timezone), [timezone]);

  return (
    <Popover isOpen={isOpen} placement="bottom" onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <div className={clsx("w-full", className)}>
          <IBaseInput
            {...rest}
            ref={inputRef}
            endContent={
              endContent ?? (
                <Clock
                  aria-hidden="true"
                  className="text-default-400"
                  size={16}
                />
              )
            }
            isDisabled={isDisabled}
            isInvalid={rest.isInvalid || isDraftInvalid}
            value={draftText}
            onChange={(e) => {
              const next = e.target.value;

              setDraftText(next);
              if (!next.trim()) {
                setIsDraftInvalid(false);

                return;
              }
              setIsDraftInvalid(!toDayjs(next, format, timezone));
            }}
            onClick={handleClick}
            onKeyDown={handleKey}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent className="p-2">
        <div className="flex flex-col gap-2">
          {showNow ? (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="flat"
                onPress={() => {
                  const out = formatDayjs(now, format, timezone);

                  setDraftText(out);
                  setIsDraftInvalid(false);
                }}
              >
                Now
              </Button>
            </div>
          ) : null}
          <div className="max-h-64 w-56 overflow-auto">
            <div className="grid grid-cols-2 gap-1">
              {times.map((t) => (
                <Button
                  key={t}
                  className="justify-start"
                  size="sm"
                  variant="light"
                  onPress={() => {
                    setDraftText(t);
                    setIsDraftInvalid(false);
                  }}
                >
                  {t}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
