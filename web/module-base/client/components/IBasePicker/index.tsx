"use client";

import type { ComponentType } from "react";

import IBaseDatePicker, {
  type IBaseDatePickerProps,
  type IBaseDatePickerValue,
} from "./IBaseDatePicker";
import IBaseDateRangePicker, {
  type IBaseDateRangePickerProps,
  type IBaseDateRangePickerValue,
  type RangePreset,
} from "./IBaseDateRangePicker";
import IBaseMonthPicker, {
  type IBaseMonthPickerProps,
  type IBaseMonthPickerValue,
} from "./IBaseMonthPicker";
import IBaseTimePicker, {
  type IBaseTimePickerProps,
  type IBaseTimePickerValue,
} from "./IBaseTimePicker";
import IBaseYearPicker, {
  type IBaseYearPickerProps,
  type IBaseYearPickerValue,
} from "./IBaseYearPicker";
import ButtonFastChoose, {
  type ButtonFastChooseProps,
} from "./components/ButtonFastChoose";

export type IBasePickerDateProps = IBaseDatePickerProps;
export type IBasePickerRangeProps = IBaseDateRangePickerProps;
export type IBasePickerTimeProps = IBaseTimePickerProps;
export type IBasePickerMonthProps = IBaseMonthPickerProps;
export type IBasePickerYearProps = IBaseYearPickerProps;

// Re-export canonical component names/types for `@base/client/components` barrel.
export {
  ButtonFastChoose,
  IBaseDatePicker,
  IBaseDateRangePicker,
  IBaseMonthPicker,
  IBaseTimePicker,
  IBaseYearPicker,
};
export type {
  ButtonFastChooseProps,
  IBaseDatePickerProps,
  IBaseDatePickerValue,
  IBaseDateRangePickerProps,
  IBaseDateRangePickerValue,
  IBaseMonthPickerProps,
  IBaseMonthPickerValue,
  IBaseTimePickerProps,
  IBaseTimePickerValue,
  IBaseYearPickerProps,
  IBaseYearPickerValue,
  RangePreset,
};

export type IBasePickerComponent = ComponentType<IBaseDatePickerProps> & {
  Date: ComponentType<IBaseDatePickerProps>;
  Range: ComponentType<IBaseDateRangePickerProps>;
  Time: ComponentType<IBaseTimePickerProps>;
  Month: ComponentType<IBaseMonthPickerProps>;
  Year: ComponentType<IBaseYearPickerProps>;
};

/**
 * IBasePicker
 * - default export: IBaseDatePicker
 * - static: Date / Range / Time / Month / Year
 */
const IBasePicker = Object.assign(IBaseDatePicker, {
  Date: IBaseDatePicker,
  Range: IBaseDateRangePicker,
  Time: IBaseTimePicker,
  Month: IBaseMonthPicker,
  Year: IBaseYearPicker,
}) as IBasePickerComponent;

export default IBasePicker;

// Named exports (optional convenience)
export {
  IBaseDatePicker as Date,
  IBaseMonthPicker as Month,
  IBaseDateRangePicker as Range,
  IBaseTimePicker as Time,
  IBaseYearPicker as Year,
};
