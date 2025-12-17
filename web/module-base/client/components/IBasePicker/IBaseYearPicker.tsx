"use client";

import type { Dayjs } from "dayjs";
import { useTranslations } from "next-intl";

import IBaseDatePicker, {
  type IBaseDatePickerProps,
  type IBaseDatePickerValue,
} from "./IBaseDatePicker";

export type IBaseYearPickerValue = IBaseDatePickerValue;

export type IBaseYearPickerProps = Omit<IBaseDatePickerProps, "quickSelect"> & {
  format?: string; // default YYYY
  showThisYear?: boolean;
};

export default function IBaseYearPicker(props: IBaseYearPickerProps) {
  const t = useTranslations("components.picker");
  const { placeholder, format = "YYYY", showThisYear = true, ...rest } = props;

  return (
    <IBaseDatePicker
      {...rest}
      placeholder={placeholder ?? t("year.placeholder", { format })}
      calendarProps={{ showMonthAndYearPickers: true, ...rest.calendarProps }}
      format={format}
      quickSelect={
        showThisYear
          ? ({
              label: t("year.thisYear"),
              getValue: (now: Dayjs) => now.startOf("year"),
            } as const)
          : false
      }
    />
  );
}
