"use client";

import { DropdownProps, Dropdown as HeroUIDropdown, DropdownItem as HeroUIDropdownItem, DropdownMenu as HeroUIDropdownMenu, DropdownSection as HeroUIDropdownSection, DropdownTrigger as HeroUIDropdownTrigger } from "@heroui/dropdown";
import React from "react";

export type IBaseDropdownProps = DropdownProps & {};

export const IBaseDropdown: React.FC<IBaseDropdownProps> = (props) => {
  return <HeroUIDropdown {...props} />;
};

export const IBaseDropdownTrigger = HeroUIDropdownTrigger;
export const IBaseDropdownMenu = HeroUIDropdownMenu;
export const IBaseDropdownItem = HeroUIDropdownItem;
export const IBaseDropdownSection = HeroUIDropdownSection;

export default IBaseDropdown;
