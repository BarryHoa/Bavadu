"use client";

import Image from "next/image";

import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Bell } from "lucide-react";

import { siteConfig } from "@/config/site";

export default function Nav() {
  return (
    <HeroNavbar
      shouldHideOnScroll
      className="border-b border-gray-200 bg-white"
      height="48px"
      maxWidth="full"
      classNames={{
        wrapper: "px-4",
      }}
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
        {/* <NavbarItem className="hidden sm:flex">
          <Button isIconOnly size="sm" variant="light">
            <Sun size={20} />
          </Button>
        </NavbarItem> */}
        <NavbarItem>
          <Badge
            color="danger"
            content=""
            shape="circle"
            placement="top-right"
            isInvisible={false}
          >
            <Button isIconOnly size="sm" variant="light">
              <Bell size={20} />
            </Button>
          </Badge>
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
