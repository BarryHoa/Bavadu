"use client";

import {
  IBaseInputNumber,
  IBaseSingleSelect,
  IBaseSingleSelectAsync,
  SelectItemOption,
} from "@base/client/components";
import ClientHttpService from "@base/client/services/ClientHttpService";
import { Button } from "@base/client";
import { Card, CardBody, Divider } from "@base/client";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";

import { ProductMasterFeatures } from "@mdl/product/client/interface/Product";

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
  const t = useTranslations("b2cSales.order.create.labels");
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

        if (response?.data) {
          const priceData = response.data;
          // Only auto-fill if unitPrice is not manually set or is 0
          const currentPrice = Number(line.unitPrice) || 0;

          if (currentPrice === 0 || currentPrice === 1) {
            setValue(
              `lines.${index}.unitPrice`,
              priceData.finalPrice.toString(),
            );
          }
        }
      } catch (error) {
        // Silently fail - user can enter price manually
        console.error("Không thể tính giá:", error);
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
      <h2 className="text-base font-semibold mb-2">{t("orderLines")}</h2>

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
                  {t("line")} {index + 1}
                </h3>
                <Button
                  isIconOnly
                  aria-label={t("removeLine")}
                  className="min-w-6 h-6"
                  color="danger"
                  isDisabled={fields.length === 1}
                  size="sm"
                  variant="light"
                  onPress={() => remove(index)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              {/* Input Fields */}
              <div className="grid gap-2 grid-cols-1 md:grid-cols-3 lg:flex">
                {/* Product - flex-grow on lg, full width on md */}
                <div className="md:col-span-3 lg:flex-1 lg:min-w-[200px]">
                  <Controller
                    control={control}
                    name={`lines.${index}.productId`}
                    render={({ field, fieldState }) => (
                      <IBaseSingleSelectAsync
                        isRequired
                        defaultParams={{
                          filters: {
                            isActive: true,
                            features: [ProductMasterFeatures.SALE],
                          },
                        }}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label={t("product")}
                        model="product.dropdown"
                        selectedKey={field.value}
                        size="sm"
                        onRenderOption={(item: any) => {
                          return (
                            <div className="flex flex-col igap-2">
                              <div>{item.localizedLabel}</div>
                              <div className="text-xs text-default-500">
                                SKU: {item.sku} - Barcode: {item.barcode}
                              </div>
                            </div>
                          );
                        }}
                        onSelectionChange={(key) => {
                          field.onChange(key || undefined);
                        }}
                      />
                    )}
                  />
                </div>

                {/* Quantity - fixed width on lg */}
                <div className="md:col-span-1 lg:w-[120px] lg:flex-shrink-0">
                  <Controller
                    control={control}
                    name={`lines.${index}.quantity`}
                    render={({ field, fieldState }) => (
                      <IBaseInputNumber
                        isRequired
                        allowNegative={false}
                        decimalPlaces={2}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label={t("quantity")}
                        max={5000}
                        min={0}
                        size="sm"
                        value={field.value ? Number(field.value) : null}
                        onValueChange={(val) =>
                          field.onChange(val?.toString() ?? "")
                        }
                      />
                    )}
                  />
                </div>

                {/* Unit Price - fixed width on lg */}
                <div className="md:col-span-1 lg:w-[160px] lg:flex-shrink-0">
                  <Controller
                    control={control}
                    name={`lines.${index}.unitPrice`}
                    render={({ field, fieldState }) => (
                      <IBaseInputNumber
                        allowNegative={false}
                        decimalPlaces={2}
                        errorMessage={fieldState.error?.message}
                        isInvalid={fieldState.invalid}
                        label={t("unitPrice")}
                        max={100000000}
                        min={0}
                        size="sm"
                        value={field.value ? Number(field.value) : null}
                        onValueChange={(val) =>
                          field.onChange(val?.toString() ?? "")
                        }
                      />
                    )}
                  />
                </div>

                {/* Discount - fixed width on lg */}
                <div className="md:col-span-1 lg:w-[200px] lg:flex-shrink-0">
                  <Controller
                    control={control}
                    name={`lines.${index}.lineDiscount`}
                    render={({ field, fieldState }) => {
                      const line = watchedLines[index];
                      const quantity = Number(line?.quantity) || 0;
                      const unitPrice = Number(line?.unitPrice) || 0;
                      const maxDiscount = quantity * unitPrice;
                      const currentDiscount = Number(field.value) || 0;
                      const isDiscountExceeded = currentDiscount > maxDiscount;

                      return (
                        <IBaseInputNumber
                          allowNegative={false}
                          decimalPlaces={2}
                          errorMessage={
                            fieldState.error?.message ||
                            (isDiscountExceeded
                              ? t("errors.discountExceeded", {
                                  max: maxDiscount.toLocaleString(),
                                })
                              : undefined)
                          }
                          isInvalid={fieldState.invalid || isDiscountExceeded}
                          label={t("discount")}
                          max={maxDiscount}
                          min={0}
                          size="sm"
                          value={field.value ? Number(field.value) : null}
                          onValueChange={(val) =>
                            field.onChange(val?.toString() ?? "")
                          }
                        />
                      );
                    }}
                  />
                </div>

                {/* Tax Rate - fixed width on lg */}
                <div className="md:col-span-1 lg:w-[150px] lg:flex-shrink-0">
                  <Controller
                    control={control}
                    name={`lines.${index}.taxRate`}
                    render={({ field, fieldState }) => (
                      <IBaseSingleSelect
                        errorMessage={fieldState.error?.message}
                        isDisabled={taxRatesQuery.isLoading}
                        isInvalid={fieldState.invalid}
                        items={taxRateOptions}
                        label={t("taxRate")}
                        selectedKey={field.value}
                        size="sm"
                        onSelectionChange={(key) => {
                          field.onChange(key || "0");
                        }}
                      />
                    )}
                  />
                </div>
              </div>

              <Divider className="my-1" />

              {/* Line Summary */}
              <div className="bg-content2 rounded-lg py-1 px-2">
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-default-500 text-xs">
                      {t("subtotal")}:
                    </span>
                    <p className="font-medium text-sm">
                      {formatCurrency(totals.lineSubtotal)}
                    </p>
                  </div>
                  <div>
                    <span className="text-default-500 text-xs">
                      {t("discount")}:
                    </span>
                    <p className="font-medium text-sm text-danger">
                      -{formatCurrency(totals.lineDiscount)}
                    </p>
                  </div>
                  <div>
                    <span className="text-default-500 text-xs">
                      {t("taxAmount")}:
                    </span>
                    <p className="font-medium text-sm">
                      {formatCurrency(totals.lineTax)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-default-500 text-xs">
                      {t("total")}:
                    </span>
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
          color="primary"
          size="sm"
          variant="solid"
          onPress={() => append(defaultLine)}
        >
          {t("addLine")}
        </Button>
      </div>

      {errors?.lines?.message ? (
        <p className="text-sm text-danger-600">
          {errors.lines.message as string}
        </p>
      ) : null}

      {fields.length === 0 && (
        <div className="text-center py-8 text-default-500">
          {t("noOrderLines")}
        </div>
      )}
    </div>
  );
}
