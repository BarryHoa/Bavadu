"use client";

import { ChipProps, Chip as HeroUIChip } from "@heroui/chip";
import React from "react";

export type IBaseChipProps = ChipProps & {};

export const IBaseChip = React.forwardRef<HTMLDivElement, IBaseChipProps>(
  (props, ref) => {
    const { size = "sm", variant = "flat", ...rest } = props;

    return <HeroUIChip ref={ref} size={size} variant={variant} {...rest} />;
  }
);

IBaseChip.displayName = "IBaseChip";

export default IBaseChip;
