"use client";

import type { Dayjs } from "dayjs";

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
  const { format = "YYYY", showThisYear = true, ...rest } = props;

  return (
    <IBaseDatePicker
      {...rest}
      calendarProps={{ showMonthAndYearPickers: true, ...rest.calendarProps }}
      format={format}
      quickSelect={
        showThisYear
          ? ({
              label: "This year",
              getValue: (now: Dayjs) => now.startOf("year"),
            } as const)
          : false
      }
    />
  );
}
