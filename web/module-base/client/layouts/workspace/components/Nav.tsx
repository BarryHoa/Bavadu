"use client";

import type { IBaseDropdownItem } from "@base/client/components";

import { Bell, LogOut, User } from "lucide-react";
import IBaseImage from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

import { siteConfig } from "@/config/site";
import {
  IBaseAvatar,
  IBaseBadge,
  IBaseButton,
  IBaseDropdown,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
  IBaseNavbar,
  IBaseNavbarBrand,
  IBaseNavbarContent,
  IBaseNavbarItem,
} from "@base/client/components";
import { useDisclosure } from "@base/client/hooks";
import { AuthService } from "@base/client/services";
import {
  broadcastPermissionsClear,
  getPermissionsStoreState,
} from "@base/client/stores";

const DEFAULT_AVATAR = "/favicon/favicon-32x32.png";

export default function Nav() {
  const t = useTranslations("auth.logoutConfirm");
  const router = useRouter();
  const authService = useMemo(() => new AuthService(), []);
  const [avatarError, setAvatarError] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {
    isOpen: isLogoutConfirmOpen,
    onOpen: openLogoutConfirm,
    onClose: closeLogoutConfirm,
  } = useDisclosure();

  // TODO: Get user data from session/context
  const userAvatar = "https://i.pravatar.cc/150?u=a042581f4e29026024d";
  const displayAvatar = avatarError ? DEFAULT_AVATAR : userAvatar;

  const performLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      closeLogoutConfirm();
      await authService.logout();
      getPermissionsStoreState().clearPermissions();
      broadcastPermissionsClear(); // other tabs will redirect to login
      router.replace("/login");
      router.refresh();
    } catch {
      router.replace("/login");
    } finally {
      setIsLoggingOut(false);
    }
  }, [authService, closeLogoutConfirm, router]);

  const handleLogoutClick = useCallback(() => {
    // Delay so dropdown close doesn't interfere with modal open
    setTimeout(() => openLogoutConfirm(), 0);
  }, [openLogoutConfirm]);

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
                onPress: handleLogoutClick,
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

      <IBaseModal
        isOpen={isLogoutConfirmOpen}
        onOpenChange={(open) => {
          if (!open) closeLogoutConfirm();
        }}
      >
        <IBaseModalContent>
          <IBaseModalHeader>{t("title")}</IBaseModalHeader>
          <IBaseModalBody>{t("message")}</IBaseModalBody>
          <IBaseModalFooter>
            <IBaseButton variant="light" onPress={closeLogoutConfirm}>
              {t("cancel")}
            </IBaseButton>
            <IBaseButton
              color="danger"
              isLoading={isLoggingOut}
              onPress={performLogout}
            >
              {t("confirm")}
            </IBaseButton>
          </IBaseModalFooter>
        </IBaseModalContent>
      </IBaseModal>
    </IBaseNavbar>
  );
}
