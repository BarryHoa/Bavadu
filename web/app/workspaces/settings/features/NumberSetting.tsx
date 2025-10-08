"use client";

import { useSettings } from "@/app/context/SettingsContext";
import Input from "@/components/base/Input/Input";
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
    <Card>
      <CardHeader>
        <div className="flex flex-col">
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-default-500">{t("description")}</p>
        </div>
      </CardHeader>
      <CardBody className="space-y-6">
        {/* Decimal Places */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t("decimalPlaces")}</h3>
            <p className="text-sm text-default-500">
              {t("decimalPlacesDescription")}
            </p>
          </div>
          <div className="space-y-2">
            <Slider
              aria-label="Decimal Places"
              step={1}
              minValue={0}
              maxValue={7}
              color="primary"
              showSteps={true}
              showOutline={false}
              disableThumbScale={true}
              hideThumb={false}
              hideValue={false}
              value={decimalPlaces}
              onChange={(value) => {
                const places = Array.isArray(value) ? value[0] : value;
                setDecimalPlaces(places);
              }}
              className="max-w-md"
              marks={[
                { value: 0, label: "0" },
                { value: 2, label: "2" },
                { value: 4, label: "4" },
                { value: 7, label: "7" },
              ]}
            />
            <div className="text-sm text-default-500">
              {t("currentValue")}: {decimalPlaces}
            </div>
          </div>
        </div>

        {/* Decimal Separator */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t("decimalSeparator")}</h3>
            <p className="text-sm text-default-500">
              {t("decimalSeparatorDescription")}
            </p>
          </div>

          <Input
            label={t("decimalSeparator")}
            placeholder={t("placeholderDecimalSeparator")}
            value={decimalSeparator}
            onValueChange={handleDecimalSeparatorChange}
            maxLength={1}
            className="max-w-xs"
            variant="bordered"
            isInvalid={!!decimalError}
            errorMessage={decimalError}
            isRequired
          />
        </div>

        {/* Thousand Separator */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">{t("thousandSeparator")}</h3>
            <p className="text-sm text-default-500">
              {t("thousandSeparatorDescription")}
            </p>
          </div>
          <Input
            label={t("thousandSeparator")}
            placeholder={t("placeholderThousandSeparator")}
            value={thousandSeparator}
            onValueChange={handleThousandSeparatorChange}
            maxLength={1}
            className="max-w-xs"
            variant="bordered"
            isInvalid={!!thousandError}
            errorMessage={thousandError}
            isRequired
          />
        </div>

        {/* Preview */}
        <div className="space-y-4 pt-2 border-t">
          <div>
            <h3 className="text-lg font-medium">{t("preview")}</h3>
            <p className="text-sm text-default-500">
              {t("previewDescription")}
            </p>
          </div>
          <div className="bg-default-100 rounded-lg p-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-default-500 mb-1">
                  {t("originalNumber")}
                </div>
                <div className="font-mono text-lg">{previewNumber}</div>
              </div>
              <div>
                <div className="text-xs text-default-500 mb-1">
                  {t("formattedNumber")}
                </div>
                <div className="font-mono text-lg font-semibold text-primary">
                  {formatNumber(previewNumber)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
