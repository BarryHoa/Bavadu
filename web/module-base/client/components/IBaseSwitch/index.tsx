"use client";

import { Switch as HeroUISwitch, SwitchProps } from "@heroui/switch";
import React from "react";

export type IBaseSwitchProps = SwitchProps & {};

export const IBaseSwitch = React.forwardRef<HTMLInputElement, IBaseSwitchProps>(
  (props, ref) => {
    const { size = "sm", ...rest } = props;

    return <HeroUISwitch ref={ref} size={size} {...rest} />;
  },
);

IBaseSwitch.displayName = "IBaseSwitch";

export default IBaseSwitch;
