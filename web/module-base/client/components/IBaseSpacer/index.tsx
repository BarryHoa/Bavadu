"use client";

import { Spacer as HeroUISpacer, SpacerProps } from "@heroui/spacer";
import React from "react";

export type IBaseSpacerProps = SpacerProps & {};

export const IBaseSpacer: React.FC<IBaseSpacerProps> = (props) => {
  return <HeroUISpacer {...props} />;
};

export default IBaseSpacer;
