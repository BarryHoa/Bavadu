"use client";

import {
  IBaseInput,
  IBaseInputNumber,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import ClientHttpService from "@base/client/services/ClientHttpService";
import { Button } from "@heroui/button";
import { Card, CardBody, Divider } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { useMemo, useEffect } from "react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";

interface OrderLinesSectionProps {
  control: Control<any>;
  fields: any[];
  append: (line: any) => void;
  remove: (index: number) => void;
  watchedLines: any[];
  watchedCurrency: string;
  watchedPriceListId?: string;
  taxRateOptions: SelectItemOption[];
  taxRatesQuery: { isLoading: boolean };
  uomOptions: SelectItemOption[];
  errors?: any;
  defaultLine: any;
  setValue: UseFormSetValue<any>;
}

const pricingService = new ClientHttpService("/api/base/price-lists");

export default function OrderLinesSection({
  control,
  fields,
  append,
  remove,
  watchedLines,
  watchedCurrency,
  watchedPriceListId,
  taxRateOptions,
  taxRatesQuery,
  uomOptions,
  errors,
  defaultLine,
  setValue,
}: OrderLinesSectionProps) {
  const DEFAULT_CURRENCY = "VND";

  // Auto-calculate price when product, quantity, or priceListId changes
  useEffect(() => {
    if (!watchedPriceListId) return;

    watchedLines.forEach(async (line, index) => {
      const productId = line.productId;
      const quantity = Number(line.quantity) || 0;

      if (!productId || quantity <= 0) return;

      try {
        // Call calculate-price API
        // Note: productId is assumed to be variantId, we'll need productMasterId too
        // For now, we'll use productId as both variantId and masterId
        const response = await pricingService.post<{
          data: {
            unitPrice: number;
            basePrice: number;
            discountAmount: number;
            finalPrice: number;
            priceSource: string;
          };
        }>("/calculate-price", {
          productVariantId: productId,
          productMasterId: productId, // TODO: Get actual masterId from product
          quantity,
          priceListId: watchedPriceListId,
        });

        if (response.data?.data) {
          const priceData = response.data.data;
          // Only auto-fill if unitPrice is not manually set or is 0
          const currentPrice = Number(line.unitPrice) || 0;
          if (currentPrice === 0 || currentPrice === 1) {
            setValue(`lines.${index}.unitPrice`, priceData.finalPrice.toString());
          }
        }
      } catch (error) {
        // Silently fail - user can enter price manually
        console.error("Failed to calculate price:", error);
      }
    });
  }, [watchedPriceListId, watchedLines, setValue]);

  // Calculate line totals for each line
  const lineTotals = useMemo(() => {
    return watchedLines.map((line) => {
      const quantity = Number(line.quantity) || 0;
      const unitPrice = Number(line.unitPrice) || 0;
      const lineDiscount = Number(line.lineDiscount) || 0;
      const taxRate = Number(line.taxRate) || 0;
      const lineSubtotal = quantity * unitPrice;
      const amount = lineSubtotal - lineDiscount; // Amount after discount
      const lineTax = (amount * taxRate) / 100;
      const lineTotal = amount + lineTax;

      return {
        lineSubtotal,
        lineDiscount,
        amount,
        lineTax,
        lineTotal,
      };
    });
  }, [watchedLines]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: watchedCurrency || DEFAULT_CURRENCY,
    }).format(value);
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Order Lines</h2>
      </div>

      {fields.map((fieldItem, index) => {
        const line = watchedLines[index];
        const totals = lineTotals[index] || {
          lineSubtotal: 0,
          lineDiscount: 0,
          amount: 0,
          lineTax: 0,
          lineTotal: 0,
        };

        return (
          <Card key={fieldItem.id} className="border border-content3/40">
            <CardBody className="p-3 space-y-2">
              {/* Header with line number and remove button */}
              <div className="flex items-center justify-between pb-1">
                <h3 className="text-xs font-medium text-default-500">
                  Line {index + 1}
                </h3>
                <Button
                  size="sm"
                  variant="light"
                  color="danger"
                  isIconOnly
                  onPress={() => remove(index)}
                  isDisabled={fields.length === 1}
                  aria-label="Remove line"
                  className="min-w-6 h-6"
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              {/* Input Fields */}
              <div className="grid gap-2 grid-cols-1 md:grid-cols-3 lg:flex">
                {/* Product - flex-grow on lg, full width on md */}
                <div className="md:col-span-3 lg:flex-1 lg:min-w-[200px]">
                  <Controller
                    name={`lines.${index}.productId`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <IBaseInput
                        {...field}
                        value={field.value}
                        onValueChange={field.onChange}
                        label="Product"
                        size="sm"
                        isRequired
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Unit of Measure - fixed width on lg */}
                <div className="md:col-span-1 lg:w-[150px] lg:flex-shrink-0">
                  <Controller
                    name={`lines.${index}.unitId`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <IBaseSingleSelect
                        label="Unit"
                        size="sm"
                        items={uomOptions}
                        selectedKey={field.value}
                        onSelectionChange={(key) => {
                          field.onChange(key || undefined);
                        }}
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Quantity - fixed width on lg */}
                <div className="md:col-span-1 lg:w-[120px] lg:flex-shrink-0">
                  <Controller
                    name={`lines.${index}.quantity`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <IBaseInputNumber
                        value={field.value ? Number(field.value) : null}
                        onValueChange={(val) =>
                          field.onChange(val?.toString() ?? "")
                        }
                        label="Quantity"
                        size="sm"
                        min={0}
                        max={5000}
                        decimalPlaces={2}
                        allowNegative={false}
                        isRequired
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Unit Price - fixed width on lg */}
                <div className="md:col-span-1 lg:w-[160px] lg:flex-shrink-0">
                  <Controller
                    name={`lines.${index}.unitPrice`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <IBaseInputNumber
                        value={field.value ? Number(field.value) : null}
                        onValueChange={(val) =>
                          field.onChange(val?.toString() ?? "")
                        }
                        label="Unit Price"
                        size="sm"
                        min={0}
                        max={100000000}
                        decimalPlaces={2}
                        allowNegative={false}
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                      />
                    )}
                  />
                </div>

                {/* Discount - fixed width on lg */}
                <div className="md:col-span-1 lg:w-[140px] lg:flex-shrink-0">
                  <Controller
                    name={`lines.${index}.lineDiscount`}
                    control={control}
                    render={({ field, fieldState }) => {
                      const line = watchedLines[index];
                      const quantity = Number(line?.quantity) || 0;
                      const unitPrice = Number(line?.unitPrice) || 0;
                      const maxDiscount = quantity * unitPrice;
                      const currentDiscount = Number(field.value) || 0;
                      const isDiscountExceeded = currentDiscount > maxDiscount;

                      return (
                        <IBaseInputNumber
                          value={field.value ? Number(field.value) : null}
                          onValueChange={(val) =>
                            field.onChange(val?.toString() ?? "")
                          }
                          label="Discount"
                          size="sm"
                          min={0}
                          max={maxDiscount}
                          decimalPlaces={2}
                          allowNegative={false}
                          isInvalid={fieldState.invalid || isDiscountExceeded}
                          errorMessage={
                            fieldState.error?.message ||
                            (isDiscountExceeded
                              ? `Discount cannot exceed ${maxDiscount.toLocaleString()} (quantity × unit price)`
                              : undefined)
                          }
                        />
                      );
                    }}
                  />
                </div>

                {/* Tax Rate - fixed width on lg */}
                <div className="md:col-span-1 lg:w-[120px] lg:flex-shrink-0">
                  <Controller
                    name={`lines.${index}.taxRate`}
                    control={control}
                    render={({ field, fieldState }) => (
                      <IBaseSingleSelect
                        label="Tax Rate"
                        items={taxRateOptions}
                        selectedKey={field.value}
                        onSelectionChange={(key) => {
                          field.onChange(key || "0");
                        }}
                        size="sm"
                        isInvalid={fieldState.invalid}
                        errorMessage={fieldState.error?.message}
                        isDisabled={taxRatesQuery.isLoading}
                      />
                    )}
                  />
                </div>
              </div>

              <Divider className="my-1" />

              {/* Line Summary */}
              <div className="bg-content2 rounded-lg p-2">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-default-500 text-xs">Subtotal:</span>
                    <p className="font-medium text-sm">
                      {formatCurrency(totals.lineSubtotal)}
                    </p>
                  </div>
                  <div>
                    <span className="text-default-500 text-xs">Discount:</span>
                    <p className="font-medium text-sm text-danger">
                      -{formatCurrency(totals.lineDiscount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-default-500 text-xs">
                      Tax Amount:
                    </span>
                    <p className="font-medium text-sm">
                      {formatCurrency(totals.lineTax)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-default-500 text-xs">Total:</span>
                    <p className="font-semibold text-primary text-base">
                      {formatCurrency(totals.lineTotal)}
                    </p>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );
      })}

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="solid"
          onPress={() => append(defaultLine)}
          color="primary"
        >
          Add line
        </Button>
      </div>

      {errors?.lines?.message ? (
        <p className="text-sm text-danger-600">
          {errors.lines.message as string}
        </p>
      ) : null}

      {fields.length === 0 && (
        <div className="text-center py-8 text-default-500">
          No order lines. Click 'Add line' to add items.
        </div>
      )}
    </div>
  );
}
