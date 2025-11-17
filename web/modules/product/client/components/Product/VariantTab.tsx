"use client";

import {
  IBaseInput,
  IBaseInputMultipleLang,
  IBaseSelectWithSearch,
  SelectItemOption,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody, Divider, Textarea } from "@heroui/react";
import { Plus, Trash } from "lucide-react";
import type { LocaleFieldValue, VariantFieldValue } from "./types";
import { updateLocaleValue } from "./types";

type VariantTabProps = {
  value: VariantFieldValue;
  variantIndex: number;
  variantErrors?: {
    name?: { en?: { message?: string } };
    sku?: { message?: string };
    barcode?: { message?: string };
    manufacturerName?: { message?: string };
    manufacturerCode?: { message?: string };
    baseUomId?: { message?: string };
    attributes?: Array<{
      code?: { message?: string };
      value?: { message?: string };
    }>;
  };
  uomOptions: SelectItemOption[];
  isBusy: boolean;
  uomQueryLoading: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onUpdate: (
    updater: (current: VariantFieldValue) => VariantFieldValue
  ) => void;
};

export default function VariantTab({
  value,
  variantIndex,
  variantErrors,
  uomOptions,
  isBusy,
  uomQueryLoading,
  canRemove,
  onRemove,
  onUpdate,
}: VariantTabProps) {
  return (
    <div className="flex flex-col gap-4 pt-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Variant {variantIndex + 1}</h2>
        <Button
          size="sm"
          variant="light"
          startContent={<Trash size={14} />}
          onPress={onRemove}
          isDisabled={isBusy || !canRemove}
        >
          Remove Variant
        </Button>
      </div>

      <IBaseInputMultipleLang
        label="Name"
        value={value.name}
        onValueChange={(langs) =>
          onUpdate((current) => ({
            ...current,
            name: langs as unknown as LocaleFieldValue,
          }))
        }
        isRequired
        isInvalid={Boolean(variantErrors?.name?.en)}
        errorMessage={variantErrors?.name?.en?.message}
        isDisabled={isBusy}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <IBaseInput
          label="SKU"
          value={value.sku ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, sku: next }))
          }
          isRequired
          isInvalid={Boolean(variantErrors?.sku)}
          errorMessage={variantErrors?.sku?.message}
          isDisabled={isBusy}
        />
        <IBaseInput
          label="Barcode"
          value={value.barcode ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, barcode: next }))
          }
          isRequired
          isInvalid={Boolean(variantErrors?.barcode)}
          errorMessage={variantErrors?.barcode?.message}
          isDisabled={isBusy}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <IBaseInput
          label="Manufacture name"
          value={value.manufacturerName ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, manufacturerName: next }))
          }
          isInvalid={Boolean(variantErrors?.manufacturerName)}
          errorMessage={variantErrors?.manufacturerName?.message}
          isDisabled={isBusy}
        />
        <IBaseInput
          label="Manufacture code"
          value={value.manufacturerCode ?? ""}
          onValueChange={(next) =>
            onUpdate((current) => ({ ...current, manufacturerCode: next }))
          }
          isInvalid={Boolean(variantErrors?.manufacturerCode)}
          errorMessage={variantErrors?.manufacturerCode?.message}
          isDisabled={isBusy}
        />
      </div>

      <IBaseSelectWithSearch
        label="Base Unit of measure"
        items={uomOptions}
        selectedKeys={value.baseUomId ? [value.baseUomId] : []}
        onSelectionChange={(keys) => {
          const keySet = keys as Set<string>;
          const [first] = Array.from(keySet);
          const nextValue =
            typeof first === "string" && first.length > 0 ? first : undefined;
          onUpdate((current) => ({ ...current, baseUomId: nextValue }));
        }}
        isLoading={uomQueryLoading}
        isRequired
        isInvalid={Boolean(variantErrors?.baseUomId)}
        errorMessage={variantErrors?.baseUomId?.message}
        isDisabled={isBusy || uomQueryLoading}
      />

      <Divider />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-medium font-medium">Packings</h4>
            <p className="text-small text-default-500">
              Define packaging options for this variant.
            </p>
          </div>
          <Button
            size="sm"
            variant="bordered"
            startContent={<Plus size={14} />}
            onPress={() =>
              onUpdate((current) => ({
                ...current,
                packings: [
                  ...(current.packings || []),
                  {
                    name: { en: "", vi: "" },
                    description: { en: "", vi: "" },
                    isActive: true,
                  },
                ],
              }))
            }
            isDisabled={isBusy}
          >
            Add packing
          </Button>
        </div>

        {!value.packings || value.packings.length === 0 ? (
          <p className="text-small text-default-500">No packing entries yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {value.packings.map((packing, packingIndex) => (
              <Card key={packingIndex} className="border border-default-200">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-small font-medium">
                      Packing #{packingIndex + 1}
                    </h5>
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<Trash size={14} />}
                      onPress={() =>
                        onUpdate((current) => ({
                          ...current,
                          packings: current.packings.filter(
                            (_, idx) => idx !== packingIndex
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <IBaseInput
                      label="Name (English)"
                      value={packing.name.en ?? ""}
                      onValueChange={(next) =>
                        onUpdate((current) => ({
                          ...current,
                          packings: current.packings.map((p, idx) =>
                            idx === packingIndex
                              ? {
                                  ...p,
                                  name: updateLocaleValue(p.name, "en", next),
                                }
                              : p
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                    <IBaseInput
                      label="Name (Vietnamese)"
                      value={packing.name.vi ?? ""}
                      onValueChange={(next) =>
                        onUpdate((current) => ({
                          ...current,
                          packings: current.packings.map((p, idx) =>
                            idx === packingIndex
                              ? {
                                  ...p,
                                  name: updateLocaleValue(p.name, "vi", next),
                                }
                              : p
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                  </div>
                  <Textarea
                    label="Description (English)"
                    value={packing.description?.en ?? ""}
                    onValueChange={(next) =>
                      onUpdate((current) => ({
                        ...current,
                        packings: current.packings.map((p, idx) =>
                          idx === packingIndex
                            ? {
                                ...p,
                                description: updateLocaleValue(
                                  p.description,
                                  "en",
                                  next
                                ),
                              }
                            : p
                        ),
                      }))
                    }
                    isDisabled={isBusy}
                  />
                  <Textarea
                    label="Description (Vietnamese)"
                    value={packing.description?.vi ?? ""}
                    onValueChange={(next) =>
                      onUpdate((current) => ({
                        ...current,
                        packings: current.packings.map((p, idx) =>
                          idx === packingIndex
                            ? {
                                ...p,
                                description: updateLocaleValue(
                                  p.description,
                                  "vi",
                                  next
                                ),
                              }
                            : p
                        ),
                      }))
                    }
                    isDisabled={isBusy}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Divider />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-medium font-medium">Attributes</h4>
            <p className="text-small text-default-500">
              Capture additional attributes for this variant.
            </p>
          </div>
          <Button
            size="sm"
            variant="bordered"
            startContent={<Plus size={14} />}
            onPress={() =>
              onUpdate((current) => ({
                ...current,
                attributes: [
                  ...(current.attributes || []),
                  {
                    code: "",
                    name: { en: "", vi: "" },
                    value: "",
                  },
                ],
              }))
            }
            isDisabled={isBusy}
          >
            Add attribute
          </Button>
        </div>

        {!value.attributes || value.attributes.length === 0 ? (
          <p className="text-small text-default-500">
            No attribute entries yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {value.attributes.map((attribute, attributeIndex) => (
              <Card key={attributeIndex} className="border border-default-200">
                <CardBody className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-small font-medium">
                      Attribute #{attributeIndex + 1}
                    </h5>
                    <Button
                      size="sm"
                      variant="light"
                      startContent={<Trash size={14} />}
                      onPress={() =>
                        onUpdate((current) => ({
                          ...current,
                          attributes: current.attributes.filter(
                            (_, idx) => idx !== attributeIndex
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    >
                      Remove
                    </Button>
                  </div>
                  <IBaseInput
                    label="Code"
                    value={attribute.code}
                    onValueChange={(next) =>
                      onUpdate((current) => ({
                        ...current,
                        attributes: current.attributes.map((a, idx) =>
                          idx === attributeIndex ? { ...a, code: next } : a
                        ),
                      }))
                    }
                    isInvalid={Boolean(
                      variantErrors?.attributes?.[attributeIndex]?.code
                    )}
                    errorMessage={
                      variantErrors?.attributes?.[attributeIndex]?.code?.message
                    }
                    isDisabled={isBusy}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <IBaseInput
                      label="Name (English)"
                      value={attribute.name.en ?? ""}
                      onValueChange={(next) =>
                        onUpdate((current) => ({
                          ...current,
                          attributes: current.attributes.map((a, idx) =>
                            idx === attributeIndex
                              ? {
                                  ...a,
                                  name: updateLocaleValue(a.name, "en", next),
                                }
                              : a
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                    <IBaseInput
                      label="Name (Vietnamese)"
                      value={attribute.name.vi ?? ""}
                      onValueChange={(next) =>
                        onUpdate((current) => ({
                          ...current,
                          attributes: current.attributes.map((a, idx) =>
                            idx === attributeIndex
                              ? {
                                  ...a,
                                  name: updateLocaleValue(a.name, "vi", next),
                                }
                              : a
                          ),
                        }))
                      }
                      isDisabled={isBusy}
                    />
                  </div>
                  <IBaseInput
                    label="Value"
                    value={attribute.value}
                    onValueChange={(next) =>
                      onUpdate((current) => ({
                        ...current,
                        attributes: current.attributes.map((a, idx) =>
                          idx === attributeIndex ? { ...a, value: next } : a
                        ),
                      }))
                    }
                    isInvalid={Boolean(
                      variantErrors?.attributes?.[attributeIndex]?.value
                    )}
                    errorMessage={
                      variantErrors?.attributes?.[attributeIndex]?.value
                        ?.message
                    }
                    isDisabled={isBusy}
                  />
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Textarea
        label="Description"
        value={value.description ?? ""}
        onValueChange={(next) =>
          onUpdate((current) => ({ ...current, description: next }))
        }
        isDisabled={isBusy}
      />
    </div>
  );
}
