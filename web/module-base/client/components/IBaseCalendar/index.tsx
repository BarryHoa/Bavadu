"use client";

import { Calendar as HeroUICalendar, CalendarProps } from "@heroui/calendar";
import React from "react";

export type IBaseCalendarProps = CalendarProps & {};

export const IBaseCalendar: React.FC<IBaseCalendarProps> = (props) => {
  return <HeroUICalendar {...props} />;
};

export default IBaseCalendar;
