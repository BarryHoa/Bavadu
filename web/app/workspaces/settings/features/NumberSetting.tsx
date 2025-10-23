"use client";

import { useSettings } from "@/app/context/SettingsContext";
import Input from "@base/components/base/Input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Slider } from "@heroui/slider";
import { useTranslations } from "next-intl";
import { useState } from "react";

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
            step={1}
            minValue={0}
            maxValue={7}
            color="primary"
            showSteps={false}
            showOutline={false}
            disableThumbScale={true}
            hideThumb={false}
            hideValue={true}
            value={decimalPlaces}
            onChange={(value) => {
              const places = Array.isArray(value) ? value[0] : value;
              setDecimalPlaces(places);
            }}
            size="sm"
          />
          <div className="text-xs text-default-500">
            {t("currentValue")}: {decimalPlaces}
          </div>
        </div>

        {/* Separators in 2 columns */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t("decimalSeparator")}
            placeholder={t("placeholderDecimalSeparator")}
            value={decimalSeparator}
            onValueChange={handleDecimalSeparatorChange}
            maxLength={1}
            variant="bordered"
            isInvalid={!!decimalError}
            errorMessage={decimalError}
            isRequired
            size="sm"
          />
          <Input
            label={t("thousandSeparator")}
            placeholder={t("placeholderThousandSeparator")}
            value={thousandSeparator}
            onValueChange={handleThousandSeparatorChange}
            maxLength={1}
            variant="bordered"
            isInvalid={!!thousandError}
            errorMessage={thousandError}
            isRequired
            size="sm"
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
