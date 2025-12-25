"use client";

import { Navbar as HeroUINavbar, NavbarBrand as HeroUINavbarBrand, NavbarContent as HeroUINavbarContent, NavbarItem as HeroUINavbarItem, NavbarMenu as HeroUINavbarMenu, NavbarMenuItem as HeroUINavbarMenuItem, NavbarMenuToggle as HeroUINavbarMenuToggle, NavbarProps } from "@heroui/navbar";
import React from "react";

export type IBaseNavbarProps = NavbarProps & {};

export const IBaseNavbar: React.FC<IBaseNavbarProps> = (props) => {
  return <HeroUINavbar {...props} />;
};

export const IBaseNavbarBrand = HeroUINavbarBrand;
export const IBaseNavbarContent = HeroUINavbarContent;
export const IBaseNavbarItem = HeroUINavbarItem;
export const IBaseNavbarMenu = HeroUINavbarMenu;
export const IBaseNavbarMenuItem = HeroUINavbarMenuItem;
export const IBaseNavbarMenuToggle = HeroUINavbarMenuToggle;


export default IBaseNavbar;
