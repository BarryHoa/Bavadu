"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@heroui/avatar";
import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@heroui/dropdown";
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Bell, LogOut, User } from "lucide-react";

import { siteConfig } from "@/config/site";

const DEFAULT_AVATAR = "/favicon/favicon-32x32.png";

export default function Nav() {
  const router = useRouter();
  const [avatarError, setAvatarError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // TODO: Get user data from session/context
  const userAvatar = "https://i.pravatar.cc/150?u=a042581f4e29026024d";
  const displayAvatar = avatarError ? DEFAULT_AVATAR : userAvatar;

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const response = await fetch("/api/base/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        // Redirect to login page
        router.push("/login");
        router.refresh();
      } else {
        console.error("Logout failed");
        // Still redirect even if logout API fails
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still redirect on error
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <HeroNavbar
      shouldHideOnScroll
      className="border-b border-gray-200 bg-white"
      classNames={{
        wrapper: "px-4",
      }}
      height="48px"
      maxWidth="full"
    >
      <NavbarBrand as="li" className="gap-3 max-w-fit">
        <div className="flex items-center">
          <Image
            priority
            alt={siteConfig.name}
            className="mr-3 rounded-lg bg-white"
            height={32}
            src="/favicon/logo.png"
            width={32}
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
            isInvisible={false}
            placement="top-right"
            shape="circle"
          >
            <Button isIconOnly size="sm" variant="light">
              <Bell size={20} />
            </Button>
          </Badge>
        </NavbarItem>
        <NavbarItem>
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                className="cursor-pointer transition-transform hover:scale-105"
                fallback={
                  <User
                    className="text-default-500"
                    size={16}
                    strokeWidth={2}
                  />
                }
                size="sm"
                src={displayAvatar}
                onError={() => setAvatarError(true)}
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="User menu" variant="flat">
              <DropdownItem
                key="logout"
                color="danger"
                isDisabled={isLoggingOut}
                startContent={<LogOut size={16} />}
                onPress={handleLogout}
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
}
