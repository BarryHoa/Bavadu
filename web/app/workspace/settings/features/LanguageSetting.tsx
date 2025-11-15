"use client";

import {
  IBaseSelectWithSearch,
  SelectItemOption,
} from "@base/client/components";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { useSettings } from "@/app/context/SettingsContext";

const languages: SelectItemOption[] = [
  { value: "en", label: "English 🇺🇸", searchText: "English en" },
  { value: "vi", label: "Tiếng Việt 🇻🇳", searchText: "Tiếng Việt vi Vietnamese" },
];

export default function LanguageSetting() {
  const t = useTranslations("language");
  const router = useRouter();
  const { locale, setLocale } = useSettings();

  const handleLanguageChange = (value: string) => {
    setLocale(value);
    localStorage.setItem("locale", value);

    // Reload page to apply new locale
    window.location.reload();
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="text-xs text-default-500">{t("description")}</p>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <IBaseSelectWithSearch
          label={t("currentLanguage")}
          placeholder={t("selectPlaceholder")}
          items={languages}
          selectedKeys={[locale]}
          onSelectionChange={(keys) => {
            const keySet = keys as Set<string>;
            const [first] = Array.from(keySet);
            if (first) {
              handleLanguageChange(first);
            }
          }}
        />
      </CardBody>
    </Card>
  );
}
