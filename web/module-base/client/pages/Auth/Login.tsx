"use client";

import { Eye, EyeOff } from "lucide-react";
import IBaseImage from "next/image";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { AuthService } from "@base/client/services";
import userService from "@base/client/services/UserService";
import {
  broadcastPermissionsRefresh,
  usePermissionsStore,
} from "@base/client/stores";
import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseCardHeader,
  IBaseCheckbox,
  IBaseInput,
  IBaseLink,
} from "@base/client/components";

const DEFAULT_PAGE_AFTER_LOGIN = "/workspace/news";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const authService = useMemo(() => new AuthService(), []);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  // F5 on login page with existing session → go to default page
  useEffect(() => {
    userService
      .getMe()
      .then((res) => {
        if (res?.data?.user) {
          router.replace(DEFAULT_PAGE_AFTER_LOGIN);
        }
      })
      .catch(() => {
        // No session or error → stay on login
      });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.login({
        username: username.trim(),
        password: password.trim(),
        rememberMe,
      });

      // Get permissions and update store (like messages after login)
      const res = await userService.getMeWithRoles();
      if (res?.data) {
        usePermissionsStore.getState().setPermissions(res.data);
        broadcastPermissionsRefresh(); // notify other tabs to refetch
      }

      router.replace(DEFAULT_PAGE_AFTER_LOGIN);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <IBaseCard className="w-full max-w-md">
        <IBaseCardHeader className="flex flex-col gap-1 px-6 pt-6">
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="flex items-center gap-3">
              <IBaseImage
                alt={t("logoAlt")}
                className="object-contain"
                height={48}
                src="/favicon/logo.png"
                width={48}
              />
              <h2 className="text-3xl font-bold text-orange-500">BAVADU</h2>
            </div>
          </div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-sm text-gray-500">{t("subtitle")}</p>
        </IBaseCardHeader>
        <IBaseCardBody className="px-6 pb-6">
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
                {error}
              </div>
            )}

            <IBaseInput
              required
              autoComplete="username"
              label={t("username")}
              placeholder={t("usernamePlaceholder")}
              value={username}
              variant="bordered"
              onChange={(e) => setUsername(e.target.value)}
            />

            <IBaseInput
              required
              autoComplete="current-password"
              endContent={
                <button
                  aria-label={
                    isPasswordVisible ? t("hidePassword") : t("showPassword")
                  }
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  {isPasswordVisible ? (
                    <EyeOff
                      className="text-default-400 pointer-events-none"
                      size={20}
                    />
                  ) : (
                    <Eye
                      className="text-default-400 pointer-events-none"
                      size={20}
                    />
                  )}
                </button>
              }
              label={t("password")}
              placeholder={t("passwordPlaceholder")}
              type={isPasswordVisible ? "text" : "password"}
              value={password}
              variant="bordered"
              onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <IBaseCheckbox
                isSelected={rememberMe}
                size="sm"
                onValueChange={setRememberMe}
              >
                <span className="text-sm">{t("rememberMe")}</span>
              </IBaseCheckbox>
              <IBaseLink
                className="text-sm text-primary-600 hover:text-primary-500"
                href="/reset-password"
              >
                {t("forgotPassword")}
              </IBaseLink>
            </div>

            <IBaseButton
              className="w-full"
              color="primary"
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              {t("submit")}
            </IBaseButton>
          </form>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
