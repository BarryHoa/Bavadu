"use client";

import {
  CheckboxGroupProps,
  CheckboxProps,
  Checkbox as HeroUICheckbox,
  CheckboxGroup as HeroUICheckboxGroup,
} from "@heroui/checkbox";
import React from "react";

export type IBaseCheckboxProps = CheckboxProps & {};

export const IBaseCheckbox = React.forwardRef<
  HTMLInputElement,
  IBaseCheckboxProps
>((props, ref) => {
  const { size = "sm", ...rest } = props;

  return <HeroUICheckbox ref={ref} size={size} {...rest} />;
});

IBaseCheckbox.displayName = "IBaseCheckbox";

export const IBaseCheckboxGroup = React.forwardRef<
  HTMLDivElement,
  CheckboxGroupProps
>((props, ref) => {
  const { size = "sm", ...rest } = props;

  return <HeroUICheckboxGroup ref={ref} size={size} {...rest} />;
});

IBaseCheckboxGroup.displayName = "IBaseCheckboxGroup";

export default IBaseCheckbox;
