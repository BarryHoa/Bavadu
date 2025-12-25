"use client";

import { IBaseDivider, IBaseInputNumber } from "@base/client/components";
import { useTranslations } from "next-intl";
import { Control, Controller } from "react-hook-form";

interface OrderTotalsSectionProps {
  control: Control<any>;
  calculatedTotals: {
    subtotal: number;
    totalLineDiscount: number;
    totalLineTax: number;
    orderDiscount: number;
    orderTax: number;
    shipping: number;
    grandTotal: number;
  };
  watchedCurrency: string;
  isShippingOtherThanPickup: boolean;
  errors?: any;
}

const DEFAULT_CURRENCY = "VND";

export default function OrderTotalsSection({
  control,
  calculatedTotals,
  watchedCurrency,
  isShippingOtherThanPickup,
  errors,
}: OrderTotalsSectionProps) {
  const t = useTranslations("b2cSales.order.create.labels");
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: watchedCurrency || DEFAULT_CURRENCY,
    }).format(value);
  };

  return (
    <div>
      <h2 className="text-base font-semibold mb-2">{t("orderTotals")}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Left Column: Order Discount, Tax and Details */}
        <div className="space-y-3">
          <div className="grid gap-2">
            <Controller
              control={control}
              name="totalDiscount"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  allowNegative={false}
                  decimalPlaces={2}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("orderDiscount")}
                  min={0}
                  size="sm"
                  value={field.value ? Number(field.value) : 0}
                  onValueChange={(val) =>
                    field.onChange(val?.toString() ?? "0")
                  }
                />
              )}
            />
            <Controller
              control={control}
              name="totalTax"
              render={({ field, fieldState }) => (
                <IBaseInputNumber
                  allowNegative={false}
                  decimalPlaces={2}
                  errorMessage={fieldState.error?.message}
                  isInvalid={fieldState.invalid}
                  label={t("orderTax")}
                  min={0}
                  size="sm"
                  value={field.value ? Number(field.value) : 0}
                  onValueChange={(val) =>
                    field.onChange(val?.toString() ?? "0")
                  }
                />
              )}
            />
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="flex flex-col justify-center">
          <div className="p-4 bg-content2 rounded-lg border-l-4 border-primary space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm text-default-600">{t("subtotal")}:</span>
              <span className="text-lg font-semibold">
                {formatCurrency(calculatedTotals.subtotal)}
              </span>
            </div>
            {/* Details Breakdown */}
            <div className="flex justify-between text-xs text-default-500">
              <span>{t("lineDiscounts")}:</span>
              <span>{formatCurrency(calculatedTotals.totalLineDiscount)}</span>
            </div>
            <div className="flex justify-between text-xs text-default-500">
              <span>{t("orderDiscount")}:</span>
              <span>{formatCurrency(calculatedTotals.orderDiscount)}</span>
            </div>
            <div className="flex justify-between text-xs text-default-500">
              <span>{t("lineTaxes")}:</span>
              <span>{formatCurrency(calculatedTotals.totalLineTax)}</span>
            </div>
            <div className="flex justify-between text-xs text-default-500">
              <span>{t("orderTax")}:</span>
              <span>{formatCurrency(calculatedTotals.orderTax)}</span>
            </div>
            {isShippingOtherThanPickup && (
              <div className="flex justify-between text-xs text-default-500">
                <span>{t("shippingFee")}:</span>
                <span>{formatCurrency(calculatedTotals.shipping)}</span>
              </div>
            )}
            <IBaseDivider />
            <div className="flex justify-between items-center">
              <span className="text-base font-semibold">
                {t("grandTotal")}:
              </span>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency(calculatedTotals.grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
