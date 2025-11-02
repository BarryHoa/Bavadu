"use client";

import Input from "@/module-base/client/components/Input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Slider } from "@heroui/slider";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { useSettings } from "@/app/context/SettingsContext";

export default function NumberSetting() {
  const t = useTranslations("number");
  const {
    decimalPlaces,
    setDecimalPlaces,
    decimalSeparator,
    setDecimalSeparator,
    thousandSeparator,
    setThousandSeparator,
    formatNumber,
  } = useSettings();

  const [previewNumber] = useState(1234567.89123);
  const [decimalError, setDecimalError] = useState("");
  const [thousandError, setThousandError] = useState("");

  const validateSeparators = (
    newDecimal: string,
    newThousand: string
  ): boolean => {
    // Check if empty
    if (!newDecimal || newDecimal.trim() === "") {
      setDecimalError(t("errorEmpty"));

      return false;
    }
    if (!newThousand || newThousand.trim() === "") {
      setThousandError(t("errorEmpty"));

      return false;
    }

    // Check if same
    if (newDecimal === newThousand) {
      setDecimalError(t("errorSame"));
      setThousandError(t("errorSame"));

      return false;
    }

    // Clear errors
    setDecimalError("");
    setThousandError("");

    return true;
  };

  const handleDecimalSeparatorChange = (value: string) => {
    if (!value || value.trim() === "") {
      setDecimalError(t("errorEmpty"));

      return;
    }

    if (value === thousandSeparator) {
      setDecimalError(t("errorSame"));

      return;
    }

    setDecimalError("");
    setThousandError("");
    setDecimalSeparator(value);
  };

  const handleThousandSeparatorChange = (value: string) => {
    if (!value || value.trim() === "") {
      setThousandError(t("errorEmpty"));

      return;
    }

    if (value === decimalSeparator) {
      setThousandError(t("errorSame"));

      return;
    }

    setDecimalError("");
    setThousandError("");
    setThousandSeparator(value);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{t("title")}</h2>
          <p className="text-xs text-default-500">{t("description")}</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-3 pt-2">
        {/* Decimal Places */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("decimalPlaces")}</label>
          <Slider
            aria-label="Decimal Places"
            color="primary"
            disableThumbScale={true}
            hideThumb={false}
            hideValue={true}
            maxValue={7}
            minValue={0}
            showOutline={false}
            showSteps={false}
            size="sm"
            step={1}
            value={decimalPlaces}
            onChange={(value) => {
              const places = Array.isArray(value) ? value[0] : value;

              setDecimalPlaces(places);
            }}
          />
          <div className="text-xs text-default-500">
            {t("currentValue")}: {decimalPlaces}
          </div>
        </div>

        {/* Separators in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            isRequired
            errorMessage={decimalError}
            isInvalid={!!decimalError}
            label={t("decimalSeparator")}
            maxLength={1}
            placeholder={t("placeholderDecimalSeparator")}
            size="sm"
            value={decimalSeparator}
            variant="bordered"
            onValueChange={handleDecimalSeparatorChange}
          />
          <Input
            isRequired
            errorMessage={thousandError}
            isInvalid={!!thousandError}
            label={t("thousandSeparator")}
            maxLength={1}
            placeholder={t("placeholderThousandSeparator")}
            size="sm"
            value={thousandSeparator}
            variant="bordered"
            onValueChange={handleThousandSeparatorChange}
          />
        </div>

        {/* Compact Preview */}
        <div className="bg-default-100 rounded-lg p-2 mt-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <div className="text-xs text-default-500">{t("preview")}</div>
              <div className="font-mono text-sm">{previewNumber}</div>
            </div>
            <div className="text-default-400">→</div>
            <div className="flex-1 text-right">
              <div className="text-xs text-default-500">
                {t("formattedNumber")}
              </div>
              <div className="font-mono text-sm font-semibold text-primary">
                {formatNumber(previewNumber)}
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
