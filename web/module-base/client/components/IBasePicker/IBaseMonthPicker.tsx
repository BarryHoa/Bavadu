"use client";

import type { Dayjs } from "dayjs";

import { useTranslations } from "next-intl";

import IBaseDatePicker, {
  type IBaseDatePickerProps,
  type IBaseDatePickerValue,
} from "./IBaseDatePicker";

export type IBaseMonthPickerValue = IBaseDatePickerValue;

export type IBaseMonthPickerProps = Omit<
  IBaseDatePickerProps,
  "quickSelect"
> & {
  format?: string; // default YYYY-MM
  showThisMonth?: boolean;
};

export default function IBaseMonthPicker(props: IBaseMonthPickerProps) {
  const t = useTranslations("components.picker");
  const {
    placeholder,
    format = "MM/YYYY",
    showThisMonth = true,
    ...rest
  } = props;

  return (
    <IBaseDatePicker
      {...rest}
      calendarProps={{ showMonthAndYearPickers: true, ...rest.calendarProps }}
      format={format}
      placeholder={placeholder ?? t("month.placeholder", { format })}
      quickSelect={
        showThisMonth
          ? ({
              label: t("month.thisMonth"),
              getValue: (now: Dayjs) => now.startOf("month"),
            } as const)
          : false
      }
    />
  );
}
