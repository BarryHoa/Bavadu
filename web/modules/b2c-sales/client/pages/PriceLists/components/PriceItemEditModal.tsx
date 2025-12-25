"use client";

import {
  IBaseInputNumber,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import { useLocalizedText } from "@base/client/hooks/useLocalizedText";
import { IBaseButton } from "@base/client";
import { IBaseModal, IBaseModalBody, IBaseModalContent, IBaseModalFooter, IBaseModalHeader,  } from "@base/client";
import { AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { Control, Controller, UseFormSetValue } from "react-hook-form";

interface PriceItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  index: number;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  variantOptions: SelectItemOption[];
  uomOptions: SelectItemOption[];
  getAvailableUomsForVariant: (
    variantId: string | undefined,
  ) => SelectItemOption[];
  watchedPriceItems: any[];
  isLoading?: boolean;
}

export default function PriceItemEditModal({
  isOpen,
  onClose,
  index,
  control,
  setValue,
  variantOptions,
  uomOptions,
  getAvailableUomsForVariant,
  watchedPriceItems,
  isLoading = false,
}: PriceItemEditModalProps) {
  const getLocalizedText = useLocalizedText();
  const currentItem = watchedPriceItems?.[index];
  const variantId = currentItem?.variantId;
  const minimumQuantity = currentItem?.minimumQuantity;
  const availableUoms = getAvailableUomsForVariant(variantId);

  // Check for duplicate
  const isDuplicate = useMemo(() => {
    if (!variantId || !minimumQuantity) return false;

    return watchedPriceItems.some(
      (item: any, idx: number) =>
        idx !== index &&
        item.variantId === variantId &&
        item.minimumQuantity === minimumQuantity,
    );
  }, [variantId, minimumQuantity, watchedPriceItems, index]);

  // Get variant name
  const variantName = useMemo(() => {
    if (!variantId) return "";
    const variant = variantOptions.find((v) => v.value === variantId);

    if (!variant) return "";

    return typeof variant.label === "string"
      ? variant.label
      : getLocalizedText(variant.label);
  }, [variantId, variantOptions, getLocalizedText]);

  // Get all tiers for this variant
  const variantTiers = useMemo(() => {
    if (!variantId) return [];

    return watchedPriceItems
      .filter(
        (item: any, idx: number) =>
          idx !== index && item.variantId === variantId && item.minimumQuantity,
      )
      .map((item: any) => ({
        minQty: Number(item.minimumQuantity) || 0,
        price: Number(item.unitPrice) || 0,
      }))
      .sort((a, b) => a.minQty - b.minQty);
  }, [variantId, watchedPriceItems, index]);

  const handleVariantChange = (key: string) => {
    if (key) {
      const variant = variantOptions.find((v) => v.value === key);

      if (variant) {
        const saleUomId =
          typeof variant.saleUomId === "string" ? variant.saleUomId : undefined;
        const baseUomId =
          typeof variant.baseUomId === "string" ? variant.baseUomId : undefined;
        const uomId = saleUomId || baseUomId;

        if (uomId) {
          setValue(`priceItems.${index}.uomId`, uomId, {
            shouldValidate: false,
          });
        }
      }
    } else {
      setValue(`priceItems.${index}.uomId`, "", {
        shouldValidate: false,
      });
    }
  };

  return (
    <IBaseModal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      onClose={onClose}
    >
      <IBaseModalContent>
        <IBaseModalHeader className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold">Edit Price Item</h3>
        </IBaseModalHeader>
        <IBaseModalBody className="py-4">
          <div className="space-y-4">
            {/* Alerts */}
            {isDuplicate && (
              <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg flex items-center gap-2 text-warning-700 text-sm">
                <AlertCircle size={16} />
                <span>
                  This variant + minimum quantity combination already exists
                </span>
              </div>
            )}

            {variantTiers.length > 0 && (
              <div className="p-3 bg-default-50 border border-default-200 rounded-lg text-sm text-default-600">
                <div className="font-semibold mb-2">
                  {variantName} - Tiered Pricing:
                </div>
                <div className="flex flex-wrap gap-2">
                  {variantTiers.map((tier, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-white rounded text-xs"
                    >
                      {tier.minQty}+: {tier.price.toLocaleString()} VND
                    </span>
                  ))}
                  {minimumQuantity && (
                    <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded font-semibold text-xs">
                      {minimumQuantity}+:{" "}
                      {Number(currentItem?.unitPrice || 0).toLocaleString()} VND
                      (current)
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Form Fields - Grid Layout */}
            <div className="space-y-4">
              {/* Product Variant - Full Width */}
              <Controller
                control={control}
                name={`priceItems.${index}.variantId`}
                render={({ field, fieldState }) => (
                  <IBaseSingleSelect
                    isRequired
                    errorMessage={
                      fieldState.error?.message ||
                      (isDuplicate
                        ? "This variant + minimum quantity combination already exists"
                        : undefined)
                    }
                    isInvalid={fieldState.invalid || isDuplicate}
                    isLoading={isLoading}
                    items={variantOptions}
                    label="Product (Variant)"
                    searchPlaceholder="Search product variant..."
                    selectedKey={field.value}
                    size="sm"
                    onSelectionChange={(key) => {
                      field.onChange(key || "");
                      handleVariantChange(key || "");
                    }}
                  />
                )}
              />

              {/* UOM - Full Width */}
              <Controller
                control={control}
                name={`priceItems.${index}.uomId`}
                render={({ field: uomField, fieldState: uomFieldState }) => (
                  <IBaseSingleSelect
                    isRequired
                    errorMessage={uomFieldState.error?.message}
                    isDisabled={!variantId || availableUoms.length === 0}
                    isInvalid={uomFieldState.invalid}
                    items={availableUoms}
                    label="UOM"
                    selectedKey={uomField.value}
                    size="sm"
                    onSelectionChange={(key) => {
                      uomField.onChange(key || "");
                    }}
                  />
                )}
              />

              {/* Quantity and Unit Price - Same Row */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  control={control}
                  name={`priceItems.${index}.minimumQuantity`}
                  render={({ field, fieldState }) => (
                    <IBaseInputNumber
                      isRequired
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid || isDuplicate}
                      label="Minimum Quantity"
                      min={1}
                      size="sm"
                      value={field.value ? Number(field.value) : undefined}
                      onValueChange={(value) =>
                        field.onChange(value?.toString() || "")
                      }
                    />
                  )}
                  rules={{
                    required: "Minimum quantity is required",
                    validate: (value) => {
                      if (!value) return true;
                      const numValue = Number(value);

                      if (numValue < 1)
                        return "Minimum quantity must be at least 1";
                      // Check duplicate
                      const duplicate = watchedPriceItems.some(
                        (item: any, idx: number) =>
                          idx !== index &&
                          item.variantId === variantId &&
                          item.minimumQuantity === value,
                      );

                      if (duplicate) {
                        return "This variant + minimum quantity combination already exists";
                      }

                      return true;
                    },
                  }}
                />

                <Controller
                  control={control}
                  name={`priceItems.${index}.unitPrice`}
                  render={({ field, fieldState }) => (
                    <IBaseInputNumber
                      isRequired
                      errorMessage={fieldState.error?.message}
                      isInvalid={fieldState.invalid}
                      label="Unit Price (VND)"
                      min={0}
                      size="sm"
                      value={field.value ? Number(field.value) : undefined}
                      onValueChange={(value) =>
                        field.onChange(value?.toString() || "")
                      }
                    />
                  )}
                />
              </div>
            </div>
          </div>
        </IBaseModalBody>
        <IBaseModalFooter>
          <IBaseButton variant="light" onPress={onClose}>
            Cancel
          </IBaseButton>
          <IBaseButton color="primary" onPress={onClose}>
            Save
          </IBaseButton>
        </IBaseModalFooter>
      </IBaseModalContent>
    </IBaseModal>
  );
}
