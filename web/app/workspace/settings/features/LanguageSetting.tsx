"use client";

import { useSettings } from "@/app/context/SettingsContext";
import SelectBase from "@base/components/base/Select";
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
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="text-xs text-default-500">{t("description")}</p>
        </div>
      </CardHeader>
      <CardBody className="pt-2">
        <SelectBase
          label={t("currentLanguage")}
          placeholder={t("selectPlaceholder")}
          selectedKeys={[locale]}
          onChange={(e) => handleLanguageChange(e.target.value)}
          variant="bordered"
          labelPlacement="outside"
          size="sm"
        >
          {languages.map((lang) => (
            <SelectItem key={lang.code} textValue={lang.name}>
              <div className="flex items-center gap-2">
                <span className="text-lg">{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectBase>
      </CardBody>
    </Card>
  );
}
