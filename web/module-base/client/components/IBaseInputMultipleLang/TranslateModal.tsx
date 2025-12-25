"use client";

import {
  IBaseButton,
  IBaseInput,
  IBaseModal,
  IBaseModalBody,
  IBaseModalContent,
  IBaseModalFooter,
  IBaseModalHeader,
} from "@base/client/components";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import {
  DEFAULT_SUPPORTED_LANGS,
  LocalizeText,
  LocalizeTextKey,
} from "../../interface/LocalizeText";

export interface TranslateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (langs: LocalizeText) => void;
  value?: LocalizeText | string;
}

export default function TranslateModal({
  isOpen,
  onClose,
  onSave,
  value,
}: TranslateModalProps) {
  const t = useTranslations("components.translate");
  const tCommon = useTranslations("common.actions");
  const currentLocale = useLocale();
  const [langValues, setLangValues] = useState<LocalizeText>(() => {
    if (typeof value === "object" && value !== null) {
      return value as LocalizeText;
    }

    return DEFAULT_SUPPORTED_LANGS.reduce<LocalizeText>((acc, lang) => {
      acc[lang as LocalizeTextKey] =
        (value as unknown as LocalizeText)?.[lang as LocalizeTextKey] ?? "";

      return acc;
    }, {} as LocalizeText);
  });
  const labelText = useMemo(() => {
    return {
      en: t("english"),
      vi: t("vietnamese"),
    };
  }, [t]);

  // Update when initialLangs change

  const handleLangChange = (lang: LocalizeTextKey, newValue: string) => {
    setLangValues((prev) => ({
      ...prev,
      [lang]: newValue,
    }));
  };

  const handleSave = () => {
    onSave(langValues);
    onClose();
  };

  return (
    <IBaseModal isOpen={isOpen} placement="center" size="md" onClose={onClose}>
      <IBaseModalContent>
        {() => (
          <>
            <IBaseModalHeader className="flex items-center gap-2">
              <Languages size={20} />
              {t("title")}
            </IBaseModalHeader>
            <IBaseModalBody className="space-y-4">
              {DEFAULT_SUPPORTED_LANGS.filter(
                (lang) => lang !== currentLocale
              ).map((lang) => (
                <div key={lang} className="flex flex-col gap-2">
                  <label className="text-sm font-medium">
                    {labelText[lang as LocalizeTextKey] ?? lang.toUpperCase()}
                  </label>
                  <IBaseInput
                    value={langValues[lang as LocalizeTextKey]}
                    variant="bordered"
                    onValueChange={(val) =>
                      handleLangChange(lang as LocalizeTextKey, val)
                    }
                  />
                </div>
              ))}
            </IBaseModalBody>
            <IBaseModalFooter>
              <IBaseButton variant="light" onPress={onClose}>
                {tCommon("cancel")}
              </IBaseButton>
              <IBaseButton color="primary" onPress={handleSave}>
                {tCommon("save")}
              </IBaseButton>
            </IBaseModalFooter>
          </>
        )}
      </IBaseModalContent>
    </IBaseModal>
  );
}
