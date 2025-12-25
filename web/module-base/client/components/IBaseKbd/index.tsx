"use client";

import { Kbd as HeroUIKbd, KbdProps } from "@heroui/kbd";
import React from "react";

export type IBaseKbdProps = KbdProps & {};

export const IBaseKbd: React.FC<IBaseKbdProps> = (props) => {
  return <HeroUIKbd {...props} />;
};

export default IBaseKbd;
