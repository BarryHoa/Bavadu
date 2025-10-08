"use client";

import { useSettings } from "@/app/context/SettingsContext";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
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
    <Card>
      <CardHeader>
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-default-500">{t("description")}</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("selectLanguage")}</h3>

          <Select
            label={t("currentLanguage")}
            placeholder={t("selectPlaceholder")}
            selectedKeys={[locale]}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="max-w-xs"
            variant="bordered"
          >
            {languages.map((lang) => (
              <SelectItem key={lang.code} textValue={lang.name}>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  <span>{lang.name}</span>
                </div>
              </SelectItem>
            ))}
          </Select>
        </div>
      </CardBody>
    </Card>
  );
}
