"use client";

import {
  Popover as HeroUIPopover,
  PopoverContent as HeroUIPopoverContent,
  PopoverTrigger as HeroUIPopoverTrigger,
  PopoverProps,
} from "@heroui/popover";
import React from "react";

export type IBasePopoverProps = PopoverProps & {};

export const IBasePopover: React.FC<IBasePopoverProps> = (props) => {
  return <HeroUIPopover {...props} />;
};

export const IBasePopoverTrigger = HeroUIPopoverTrigger;
export const IBasePopoverContent = HeroUIPopoverContent;

export default IBasePopover;
