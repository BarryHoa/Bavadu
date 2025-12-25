"use client";

import { Spinner as HeroUISpinner, SpinnerProps } from "@heroui/spinner";
import React from "react";

export type IBaseSpinnerProps = SpinnerProps & {};

export const IBaseSpinner = React.forwardRef<HTMLDivElement, IBaseSpinnerProps>(
  (props, ref) => {
    const { size = "sm", ...rest } = props;

    return <HeroUISpinner ref={ref} size={size} {...rest} />;
  },
);

IBaseSpinner.displayName = "IBaseSpinner";

export default IBaseSpinner;
