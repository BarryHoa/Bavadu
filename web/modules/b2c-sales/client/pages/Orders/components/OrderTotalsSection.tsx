"use client";

import { IBaseInputNumber } from "@base/client/components";
import { Divider } from "@heroui/react";
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
  return (
    <div>
      <h2 className="text-base font-semibold mb-2">Order Totals</h2>
      <div className="grid gap-2 md:grid-cols-3">
        <Controller
          name="totalDiscount"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseInputNumber
              value={field.value ? Number(field.value) : 0}
              onValueChange={(val) => field.onChange(val?.toString() ?? "0")}
              size="sm"
              label="Order Discount"
              min={0}
              decimalPlaces={2}
              allowNegative={false}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="totalTax"
          control={control}
          render={({ field, fieldState }) => (
            <IBaseInputNumber
              value={field.value ? Number(field.value) : 0}
              onValueChange={(val) => field.onChange(val?.toString() ?? "0")}
              size="sm"
              label="Order Tax"
              min={0}
              decimalPlaces={2}
              allowNegative={false}
              isInvalid={fieldState.invalid}
              errorMessage={fieldState.error?.message}
            />
          )}
        />
      </div>

      {/* Summary */}
      <div className="mt-2 p-2 bg-content2 rounded-lg space-y-1">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span className="font-medium">
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: watchedCurrency || DEFAULT_CURRENCY,
            }).format(calculatedTotals.subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-default-500">
          <span>Line Discounts:</span>
          <span>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: watchedCurrency || DEFAULT_CURRENCY,
            }).format(calculatedTotals.totalLineDiscount)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-default-500">
          <span>Order Discount:</span>
          <span>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: watchedCurrency || DEFAULT_CURRENCY,
            }).format(calculatedTotals.orderDiscount)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-default-500">
          <span>Line Taxes:</span>
          <span>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: watchedCurrency || DEFAULT_CURRENCY,
            }).format(calculatedTotals.totalLineTax)}
          </span>
        </div>
        <div className="flex justify-between text-xs text-default-500">
          <span>Order Tax:</span>
          <span>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: watchedCurrency || DEFAULT_CURRENCY,
            }).format(calculatedTotals.orderTax)}
          </span>
        </div>
        {isShippingOtherThanPickup && (
          <div className="flex justify-between text-xs text-default-500">
            <span>Shipping Fee:</span>
            <span>
              {new Intl.NumberFormat(undefined, {
                style: "currency",
                currency: watchedCurrency || DEFAULT_CURRENCY,
              }).format(calculatedTotals.shipping)}
            </span>
          </div>
        )}
        <Divider className="my-1" />
        <div className="flex justify-between text-base font-semibold">
          <span>Grand Total:</span>
          <span>
            {new Intl.NumberFormat(undefined, {
              style: "currency",
              currency: watchedCurrency || DEFAULT_CURRENCY,
            }).format(calculatedTotals.grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}

