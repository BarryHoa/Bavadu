"use client";

import type { IBaseDropdownItem } from "@base/client/components";

import { Bell, LogOut, User } from "lucide-react";
import IBaseImage from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  IBaseNavbar,
  IBaseDropdown,
  IBaseNavbarBrand,
  IBaseNavbarContent,
  IBaseNavbarItem,
} from "@base/client/components";
import { IBaseAvatar, IBaseBadge, IBaseButton } from "@base/client/components";
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
    <IBaseNavbar
      shouldHideOnScroll
      className="border-b border-gray-200 bg-white"
      classNames={{
        wrapper: "px-4",
      }}
      height="48px"
      maxWidth="full"
    >
      <IBaseNavbarBrand as="li" className="gap-3 max-w-fit">
        <div className="flex items-center">
          <IBaseImage
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
      </IBaseNavbarBrand>

      <IBaseNavbarContent className="hidden md:flex" justify="end">
        {/* <IBaseNavbarItem className="hidden sm:flex">
          <IBaseButton isIconOnly size="sm" variant="light">
            <Sun size={20} />
          </IBaseButton>
        </IBaseNavbarItem> */}
        <IBaseNavbarItem>
          <IBaseBadge
            color="danger"
            content=""
            isInvisible={false}
            placement="top-right"
            shape="circle"
          >
            <IBaseButton isIconOnly size="sm" variant="light">
              <Bell size={20} />
            </IBaseButton>
          </IBaseBadge>
        </IBaseNavbarItem>
        <IBaseNavbarItem>
          <IBaseDropdown
            items={[
              {
                key: "logout",
                color: "danger",
                isDisabled: isLoggingOut,
                startContent: <LogOut size={16} />,
                textValue: "Logout",
                onPress: handleLogout,
                children: isLoggingOut ? "Logging out..." : "Logout",
              } satisfies IBaseDropdownItem,
            ]}
            menu={{
              "aria-label": "User menu",
              variant: "flat",
            }}
            placement="bottom-end"
          >
            <IBaseAvatar
              className="cursor-pointer transition-transform hover:scale-105"
              fallback={
                <User className="text-default-500" size={16} strokeWidth={2} />
              }
              size="sm"
              src={displayAvatar}
              onError={() => setAvatarError(true)}
            />
          </IBaseDropdown>
        </IBaseNavbarItem>
      </IBaseNavbarContent>
    </IBaseNavbar>
  );
}
