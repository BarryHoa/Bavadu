"use client";

import { IBaseInput } from "@base/client/components";
import { Button } from "@heroui/button";
import type { InputProps } from "@heroui/input";
import { ArrowRight, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React, { useCallback, useMemo, useState } from "react";
import {
  DEFAULT_SUPPORTED_LANGS,
  LocalizeText,
  LocalizeTextKey,
} from "../../interface/LocalizeText";
import TranslateModal from "./TranslateModal";

type IBaseInputMultipleLangProps = Omit<InputProps, "endContent" | "value"> & {
  value?: LocalizeText | string;
  onValueChange?: (value: LocalizeText) => void;
  defaultLangs?: LocalizeText;
};

// Helper function outside component to avoid recreation on each render
const getLangValue = (
  value: LocalizeText | string | undefined,
  lang: LocalizeTextKey
): string => {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "object" && value !== null) {
    return value[lang] ?? "";
  }
  return "";
};

const IBaseInputMultipleLang = React.forwardRef<
  HTMLInputElement,
  IBaseInputMultipleLangProps
>((props, ref) => {
  const t = useTranslations("components.translate");
  const locale = useLocale();
  const { value, onValueChange, defaultLangs, ...restProps } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get current locale value for main input
  const currentLocaleValue = useMemo(
    () => getLangValue(value, locale as LocalizeTextKey),
    [value, locale]
  );

  // Check if should show copy button
  const shouldShowCopyButton = useMemo(() => {
    const currentValue = currentLocaleValue.trim();
    const otherLangs = DEFAULT_SUPPORTED_LANGS.filter(
      (lang) => lang !== locale
    );
    const otherLangsValues = otherLangs.map((lang) =>
      getLangValue(value, lang as LocalizeTextKey).trim()
    );

    // Case 1: Current locale is empty but at least one other lang has value
    if (!currentValue && otherLangsValues.some((val) => val.length > 0)) {
      return true;
    }

    // Case 2: Current locale has value but all other langs are empty
    if (currentValue && otherLangsValues.every((val) => !val)) {
      return true;
    }

    return false;
  }, [currentLocaleValue, value, locale]);

  const handleMainInputChange = useCallback(
    (newValue: string) => {
      // Update the current locale's value
      const currentValue =
        typeof value === "object" && value !== null ? value : {};
      const newLocalizeValue = {
        ...currentValue,
        [locale as LocalizeTextKey]: newValue,
      } as LocalizeText;
      onValueChange?.(newLocalizeValue);
    },
    [value, locale, onValueChange]
  );

  const handleCopyToAll = useCallback(() => {
    // Copy current locale value to all languages (including current locale)
    const valueToCopy = currentLocaleValue;
    const newLocalizeValue = DEFAULT_SUPPORTED_LANGS.reduce<LocalizeText>(
      (acc, lang) => {
        acc[lang as LocalizeTextKey] = valueToCopy;
        return acc;
      },
      {} as LocalizeText
    );
    onValueChange?.(newLocalizeValue);
  }, [currentLocaleValue, onValueChange]);

  const handleSave = useCallback(
    (langs: LocalizeText) => {
      onValueChange?.(langs);
    },
    [onValueChange]
  );

  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Memoize endContent to prevent unnecessary re-renders
  const endContent = useMemo(
    () => (
      <div className="flex items-center gap-1">
        {shouldShowCopyButton && (
          <Button
            isIconOnly
            size="sm"
            variant="light"
            onPress={handleCopyToAll}
            className="min-w-0 w-6 h-6"
            title={t("copyToAll")}
          >
            <ArrowRight size={16} className="text-primary" />
          </Button>
        )}
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={handleOpenModal}
          className="min-w-0 w-6 h-6"
          title={t("title")}
        >
          <Languages size={16} className="text-primary" />
        </Button>
      </div>
    ),
    [shouldShowCopyButton, handleCopyToAll, handleOpenModal]
  );

  return (
    <>
      <IBaseInput
        ref={ref}
        value={currentLocaleValue}
        onValueChange={handleMainInputChange}
        endContent={endContent}
        {...restProps}
      />
      {isModalOpen && (
        <TranslateModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          value={value}
        />
      )}
    </>
  );
});

export default IBaseInputMultipleLang;
