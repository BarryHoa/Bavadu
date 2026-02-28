"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import {
  IBaseButton,
  IBaseCard,
  IBaseCardBody,
  IBaseCardHeader,
  IBaseInput,
  IBaseLink,
} from "@base/client/components";

export default function ResetPasswordPage() {
  const t = useTranslations("auth.resetPassword");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Implement reset password API call
      // const response = await fetch("/api/base/auth/reset-password", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ email }),
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
    } catch (err) {
      setError(t("errorGeneric"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <IBaseCard className="w-full max-w-md">
          <IBaseCardHeader className="flex flex-col gap-1 px-6 pt-6">
            <h1 className="text-2xl font-bold">{t("checkEmailTitle")}</h1>
            <p className="text-sm text-gray-500">{t("checkEmailMessage")}</p>
          </IBaseCardHeader>
          <IBaseCardBody className="px-6 pb-6">
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-600">
                {t("checkEmailDetail", { email })}
              </p>
              <IBaseLink className="text-sm text-primary-600" href="/login">
                {t("backToLogin")}
              </IBaseLink>
            </div>
          </IBaseCardBody>
        </IBaseCard>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <IBaseCard className="w-full max-w-md">
        <IBaseCardHeader className="flex flex-col gap-1 px-6 pt-6">
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
              autoComplete="email"
              label={t("email")}
              placeholder={t("emailPlaceholder")}
              type="email"
              value={email}
              variant="bordered"
              onChange={(e) => setEmail(e.target.value)}
            />

            <IBaseButton
              className="w-full"
              color="primary"
              isLoading={isLoading}
              size="lg"
              type="submit"
            >
              {t("sendLink")}
            </IBaseButton>

            <div className="text-center">
              <IBaseLink
                className="text-sm text-primary-600 hover:text-primary-500"
                href="/login"
              >
                {t("backToLogin")}
              </IBaseLink>
            </div>
          </form>
        </IBaseCardBody>
      </IBaseCard>
    </div>
  );
}
