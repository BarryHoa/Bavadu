"use client";

import {
  AccordionProps,
  Accordion as HeroUIAccordion,
  AccordionItem as HeroUIAccordionItem,
} from "@heroui/accordion";
import React from "react";

export type IBaseAccordionProps = AccordionProps & {};

export const IBaseAccordion: React.FC<IBaseAccordionProps> = (props) => {
  return <HeroUIAccordion {...props} />;
};

export const IBaseAccordionItem = HeroUIAccordionItem;

export default IBaseAccordion;
