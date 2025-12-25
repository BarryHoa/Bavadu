"use client";

import { Progress as HeroUIProgress, ProgressProps } from "@heroui/progress";
import React from "react";

export type IBaseProgressProps = ProgressProps & {};

export const IBaseProgress: React.FC<IBaseProgressProps> = (props) => {
  const { size = "sm", ...rest } = props;

  return <HeroUIProgress size={size} {...rest} />;
};

export default IBaseProgress;
