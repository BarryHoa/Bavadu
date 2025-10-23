"use client";

import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import { Sun, Bell, Menu as MenuIcon } from "lucide-react";

export default function Nav({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <HeroNavbar
      shouldHideOnScroll
      maxWidth="full"
      className="border-b border-gray-200 bg-white"
      height="48px"
    >
      <NavbarBrand as="li" className="gap-3 max-w-fit">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center mr-3">
            <span className="text-orange-600 font-bold text-lg">D</span>
          </div>
          <h1 className="text-xl font-bold text-orange-600">Seven Admin</h1>
        </div>
      </NavbarBrand>
      <NavbarContent className="lg:hidden" justify="start">
        <NavbarMenuToggle
          aria-label="Open sidebar"
          onClick={onOpenSidebar}
          icon={<MenuIcon size={20} />}
        />
      </NavbarContent>

      <NavbarContent className="hidden md:flex" justify="end">
        <NavbarItem className="hidden sm:flex">
          <Button isIconOnly variant="light" size="sm">
            <Sun size={20} />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button isIconOnly variant="light" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Avatar
            size="sm"
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            className="cursor-pointer"
          />
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
}
