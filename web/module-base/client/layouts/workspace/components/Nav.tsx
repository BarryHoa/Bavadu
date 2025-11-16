"use client";

import Image from "next/image";

import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Bell, Sun } from "lucide-react";

import { siteConfig } from "@/config/site";

export default function Nav() {
  return (
    <HeroNavbar
      shouldHideOnScroll
      className="border-b border-gray-200 bg-white"
      height="48px"
      maxWidth="full"
    >
      <NavbarBrand as="li" className="gap-3 max-w-fit">
        <div className="flex items-center">
          <Image
            src="/favicon/logo.png"
            alt={siteConfig.name}
            width={32}
            height={32}
            className="mr-3 rounded-lg bg-white"
            priority
          />
          <h1 className="text-xl font-bold text-orange-600">
            {siteConfig.name}
          </h1>
        </div>
      </NavbarBrand>

      <NavbarContent className="hidden md:flex" justify="end">
        <NavbarItem className="hidden sm:flex">
          <Button isIconOnly size="sm" variant="light">
            <Sun size={20} />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button isIconOnly className="relative" size="sm" variant="light">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Avatar
            className="cursor-pointer"
            size="sm"
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
          />
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
}
