"use client";

import { Radio as HeroUIRadio, RadioGroup as HeroUIRadioGroup, RadioGroupProps, RadioProps } from "@heroui/radio";
import React from "react";

export type IBaseRadioProps = RadioProps & {};

export const IBaseRadio = React.forwardRef<HTMLInputElement, IBaseRadioProps>(
  (props, ref) => {
    const { size = "sm", ...rest } = props;

    return <HeroUIRadio ref={ref} size={size} {...rest} />;
  },
);

IBaseRadio.displayName = "IBaseRadio";

export const IBaseRadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (props, ref) => {
    const { size = "sm", ...rest } = props;

    return <HeroUIRadioGroup ref={ref} size={size} {...rest} />;
  },
);

IBaseRadioGroup.displayName = "IBaseRadioGroup";

export default IBaseRadio;
