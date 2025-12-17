"use client";

import type { Dayjs } from "dayjs";
import React from "react";

import IBaseDatePicker, {
  type IBaseDatePickerProps,
  type IBaseDatePickerValue,
} from "./IBaseDatePicker";

export type IBaseMonthPickerValue = IBaseDatePickerValue;

export type IBaseMonthPickerProps = Omit<IBaseDatePickerProps, "quickSelect"> & {
  format?: string; // default YYYY-MM
  showThisMonth?: boolean;
};

export default function IBaseMonthPicker(props: IBaseMonthPickerProps) {
  const { format = "YYYY-MM", showThisMonth = true, ...rest } = props;

  return (
    <IBaseDatePicker
      {...rest}
      calendarProps={{ showMonthAndYearPickers: true, ...rest.calendarProps }}
      format={format}
      quickSelect={
        showThisMonth
          ? ({
              label: "This month",
              getValue: (now: Dayjs) => now.startOf("month"),
            } as const)
          : false
      }
    />
  );
}


