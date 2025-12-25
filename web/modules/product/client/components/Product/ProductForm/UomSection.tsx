"use client";

import { I_BASE_TABLE_COLUMN_KEY_ACTION, IBaseTable, IBaseInputNumber, IBaseSingleSelect, IBaseSingleSelectAsync, IBaseModal, IBaseModalBody, IBaseModalContent, IBaseModalFooter, IBaseModalHeader, SelectItemOption, type IBaseTableColumnDefinition,  } from "@base/client/components";
import { IBaseButton } from "@base/client";
import { addToast } from "@base/client";
import { Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { uuidv7 } from "uuidv7";

import {
  ProductMasterFeatures,
  ProductMasterFeaturesType,
} from "../../../interface/Product";

import { UomConversions } from "./types";

type UomSectionProps = {
  variantIndex: number;
  masterFeatures: Record<ProductMasterFeaturesType, boolean>;
  isBusy: boolean;
  error?: { message?: string };
};

export default function UomSection({
  variantIndex,
  masterFeatures,
  isBusy,
  error,
}: UomSectionProps) {
  const tProduct = useTranslations("mdl-product");
  const tProductForm = useTranslations("mdl-product.product-create");
  const t = useTranslations("common");

  const { setValue } = useFormContext();

  // Watch form values directly - now using objects {id, name}
  const baseUom = useWatch({ name: `variants.${variantIndex}.baseUom` }) as
    | { id: string; name: string }
    | undefined;
  const saleUom = useWatch({
    name: `variants.${variantIndex}.saleUom`,
  }) as { id: string; name: string } | undefined;
  const purchaseUom = useWatch({
    name: `variants.${variantIndex}.purchaseUom`,
  }) as { id: string; name: string } | undefined;
  const manufacturingUom = useWatch({
    name: `variants.${variantIndex}.manufacturingUom`,
  }) as { id: string; name: string } | undefined;
  const uomConversions = useWatch({
    name: `variants.${variantIndex}.uomConversions`,
  });

  // Extract IDs for backward compatibility
  const baseUomId = baseUom?.id;
  const saleUomIdProp = saleUom?.id;
  const purchaseUomIdProp = purchaseUom?.id;
  const manufacturingUomIdProp = manufacturingUom?.id;

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    uuid?: string;
    uomName?: string;
  }>({ isOpen: false });

  // Check if UOM is duplicate based on type
  const isDuplicateUom = useCallback(
    (
      uomId: string,
      currentUuid: string,
      currentType: ProductMasterFeaturesType | "other",
      baseUomId?: string,
    ): { isDuplicate: boolean; duplicateLabel?: string } => {
      const currentUom = uomConversions.find(
        (uom: UomConversions) => uom.uuid === currentUuid,
      );

      // If current type is "other", check against everything
      if (currentType === "other") {
        // Check against baseUomId
        if (baseUomId && uomId === baseUomId) {
          return { isDuplicate: true, duplicateLabel: "Base UOM" };
        }

        // Check against all other UOMs (sale, purchase, manufacture, and other "other" UOMs)
        const duplicate = uomConversions.find(
          (uom: UomConversions) =>
            uom.uomId === uomId && uom.uuid !== currentUuid,
        );

        if (duplicate) {
          return { isDuplicate: true, duplicateLabel: duplicate.label };
        }
      } else {
        // If current type is sale, purchase, or manufacture
        // Only check against "other" UOMs and baseUomId
        // Allow duplication with other sale/purchase/manufacture UOMs

        // Check against baseUomId
        if (baseUomId && uomId === baseUomId) {
          return { isDuplicate: true, duplicateLabel: "Base UOM" };
        }

        // Check only against "other" type UOMs
        const duplicateOther = uomConversions.find(
          (uom: UomConversions) =>
            uom.type === "other" &&
            uom.uomId === uomId &&
            uom.uuid !== currentUuid,
        );

        if (duplicateOther) {
          return { isDuplicate: true, duplicateLabel: duplicateOther.label };
        }
      }

      return { isDuplicate: false };
    },
    [uomConversions],
  );

  // Update UOM conversions in form
  const updateUomConversions = useCallback(
    (updater: (prev: UomConversions[]) => UomConversions[]) => {
      const current = uomConversions || [];
      const updated = updater(current);

      setValue(`variants.${variantIndex}.uomConversions`, updated, {
        shouldDirty: true,
        shouldValidate: false,
      });
    },
    [uomConversions, variantIndex, setValue],
  );

  // Build available UOM options (baseUom + uomConversions)
  const availableUomOptions = useMemo<SelectItemOption[]>(() => {
    if (!baseUomId) return [];

    const options = [
      {
        label: baseUom.name,
        value: baseUom.id,
      },
      ...uomConversions
        .filter((uom: UomConversions) => uom.uomId !== null)
        .map((uom: UomConversions) => ({
          label: uom.label,
          value: uom.uuid,
        })),
    ];

    return options;
  }, [baseUom, uomConversions]);

  // Check if can add more UOMs
  const canAddOtherUom = useMemo(() => {
    const MAX_OTHER_UOMS = 9;
    const uomConversionsCount = uomConversions.filter(
      (uom: UomConversions) => uom.type === "other",
    ).length;

    return uomConversionsCount < MAX_OTHER_UOMS;
  }, [uomConversions]);

  // Handle UOM selection
  const handleSelectUomConversion = useCallback(
    (
      uuid: string,
      selectedUomId: string | null,
      selectedUomName: string | null,
    ) => {
      if (!selectedUomId) {
        return;
      }

      const currentUom = uomConversions.find(
        (uom: UomConversions) => uom.uuid === uuid,
      );

      if (!currentUom) {
        return;
      }

      // Check for duplicates
      const duplicateCheck = isDuplicateUom(
        selectedUomId,
        uuid,
        currentUom.type,
        baseUomId,
      );

      if (duplicateCheck.isDuplicate) {
        addToast({
          title: tProductForm("duplicateUom"),
          description:
            tProductForm("duplicateUomDescription") +
            (selectedUomName ? ` (${selectedUomName})` : ""),
          color: "warning",
        });

        return;
      }
      // Update UOM
      updateUomConversions((prev) =>
        prev.map((item) =>
          item.uuid === uuid
            ? {
                ...item,
                uomId: selectedUomId,
                uomName: selectedUomName || "",
              }
            : item,
        ),
      );
    },
    [
      baseUomId,
      uomConversions,
      isDuplicateUom,
      updateUomConversions,
      tProductForm,
    ],
  );

  // Handle delete
  const handleDeleteUom = useCallback(
    (uuid: string) => {
      const uom = uomConversions.find((u: UomConversions) => u.uuid === uuid);

      if (uom) {
        setDeleteConfirmModal({
          isOpen: true,
          uuid,
          uomName: uom.uomName || uom.label,
        });
      }
    },
    [uomConversions],
  );

  const deleteUuid = deleteConfirmModal.uuid;
  const confirmDelete = useCallback(() => {
    if (deleteUuid) {
      updateUomConversions((prev) =>
        prev.filter((item) => item.uuid !== deleteUuid),
      );
      setDeleteConfirmModal({ isOpen: false });
    }
  }, [deleteUuid, updateUomConversions]);

  // Handle add new UOM
  const handleAddNewUom = useCallback(() => {
    if (!canAddOtherUom) return;

    updateUomConversions((prev) => [
      ...prev,
      {
        type: "other" as const,
        label: tProductForm("otherUnitOfMeasure"),
        uomId: null,
        uomName: null,
        uuid: uuidv7(),
        isActive: true,
        conversionRatio: 1,
      },
    ]);
  }, [canAddOtherUom, updateUomConversions, tProductForm]);

  // Handle conversion ratio change
  const handleConversionRatioChange = useCallback(
    (uuid: string) => (ratio: number | null | undefined) => {
      updateUomConversions((prev) =>
        prev.map((item) =>
          item.uuid === uuid
            ? { ...item, conversionRatio: ratio ?? null }
            : item,
        ),
      );
    },
    [updateUomConversions],
  );

  // Handle base UOM change
  const handleBaseUomChange = useCallback(
    (key: string | undefined, item?: SelectItemOption) => {
      if (!key) {
        setValue(`variants.${variantIndex}.baseUom`, undefined, {
          shouldDirty: true,
          shouldValidate: false,
        });

        return;
      }

      const duplicate = uomConversions.find(
        (uom: UomConversions) => uom.uomId === key,
      );

      if (duplicate) {
        addToast({
          title: tProductForm("duplicateUom"),
          description: tProductForm("duplicateUomDescription"),
          color: "warning",
        });

        return;
      }

      const name =
        typeof item?.label === "string"
          ? item.label
          : item?.label?.vi || item?.label?.en || "";

      const baseUomValue = { id: key, name };

      setValue(`variants.${variantIndex}.baseUom`, baseUomValue, {
        shouldDirty: true,
        shouldValidate: false,
      });

      // Auto-set SALE, PURCHASE, MANUFACTURE to base if not already selected
      if (key) {
        setTimeout(() => {
          if (masterFeatures[ProductMasterFeatures.SALE] && !saleUomIdProp) {
            setValue(`variants.${variantIndex}.saleUom`, baseUomValue, {
              shouldDirty: true,
              shouldValidate: false,
            });
          }
          if (
            masterFeatures[ProductMasterFeatures.PURCHASE] &&
            !purchaseUomIdProp
          ) {
            setValue(`variants.${variantIndex}.purchaseUom`, baseUomValue, {
              shouldDirty: true,
              shouldValidate: false,
            });
          }
          if (
            masterFeatures[ProductMasterFeatures.MANUFACTURE] &&
            !manufacturingUomIdProp
          ) {
            setValue(
              `variants.${variantIndex}.manufacturingUom`,
              baseUomValue,
              {
                shouldDirty: true,
                shouldValidate: false,
              },
            );
          }
        }, 100);
      }
    },
    [
      uomConversions,
      variantIndex,
      setValue,
      masterFeatures,
      saleUomIdProp,
      purchaseUomIdProp,
      manufacturingUomIdProp,
      tProductForm,
    ],
  );

  // Build table columns
  const tableColumns: IBaseTableColumnDefinition<UomConversions>[] = useMemo(
    () => [
      {
        key: "uom",
        title: tProductForm("otherUnitOfMeasure"),
        width: 300,
        render: (_, record) => {
          return (
            <IBaseSingleSelectAsync
              aria-label={tProductForm("otherUnitOfMeasure")}
              defaultParams={{
                filters: { isActive: true },
              }}
              isDisabled={isBusy || !baseUomId}
              model="product-uom.dropdown"
              selectedKey={record.uomId || undefined}
              onSelectionChange={(key, item) => {
                handleSelectUomConversion(
                  record.uuid,
                  key ?? null,
                  item?.localizedLabel ?? null,
                );
              }}
            />
          );
        },
      },
      {
        key: "conversionRatio",
        title: tProductForm("uom-section.conversionRatio"),
        width: 200,
        render: (_, record) => (
          <IBaseInputNumber
            key={`conversion-ratio-${record.uuid}`}
            decimalPlaces={4}
            id={`conversion-ratio-${record.uuid}`}
            isDisabled={isBusy || !baseUomId}
            max={10000}
            min={0.0001}
            size="sm"
            value={record.conversionRatio}
            onValueChange={handleConversionRatioChange(record.uuid)}
          />
        ),
      },
      {
        key: I_BASE_TABLE_COLUMN_KEY_ACTION,
        title: t("actions.action"),
        width: 80,
        align: "end",
        render: (_, record) => (
          <IBaseButton
            isIconOnly
            aria-label={tProductForm("deleteUom")}
            color="danger"
            isDisabled={isBusy || !baseUomId}
            size="sm"
            variant="ghost"
            onPress={() => handleDeleteUom(record.uuid)}
          >
            <Trash size={14} />
          </IBaseButton>
        ),
      },
    ],
    [
      tProductForm,
      t,
      baseUomId,
      uomConversions,
      availableUomOptions,

      isBusy,
      handleSelectUomConversion,
      handleDeleteUom,
      handleConversionRatioChange,
    ],
  );

  const isStockable = masterFeatures[ProductMasterFeatures.STOCKABLE];
  const hasFeatureUoms =
    masterFeatures[ProductMasterFeatures.SALE] ||
    masterFeatures[ProductMasterFeatures.PURCHASE] ||
    masterFeatures[ProductMasterFeatures.MANUFACTURE];

  const featureUomConfigs = useMemo(
    () =>
      [
        {
          key: ProductMasterFeatures.SALE,
          label: tProduct("productFeature.sale"),
          value: saleUomIdProp,
          uom: saleUom,
          fieldName: "saleUom",
        },
        {
          key: ProductMasterFeatures.PURCHASE,
          label: tProduct("productFeature.purchase"),
          value: purchaseUomIdProp,
          uom: purchaseUom,
          fieldName: "purchaseUom",
        },
        {
          key: ProductMasterFeatures.MANUFACTURE,
          label: tProduct("productFeature.manufacture"),
          value: manufacturingUomIdProp,
          uom: manufacturingUom,
          fieldName: "manufacturingUom",
        },
      ].filter((config) => masterFeatures[config.key]),
    [
      tProduct,
      masterFeatures,
      saleUomIdProp,
      purchaseUomIdProp,
      manufacturingUomIdProp,
      saleUom,
      purchaseUom,
      manufacturingUom,
    ],
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <h4 className="text-medium font-medium">
          {tProductForm("unitOfMeasure")}
        </h4>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-[400px]">
            <IBaseSingleSelectAsync
              isRequired
              defaultParams={{ filters: { isActive: true } }}
              errorMessage={error?.message}
              isDisabled={isBusy}
              isInvalid={Boolean(error)}
              label={
                tProductForm("baseUnitOfMeasure") +
                (isStockable
                  ? ` (${tProduct("productFeature.stockable")})`
                  : "")
              }
              model="product-uom.dropdown"
              selectedKey={baseUomId}
              onRenderOption={(item: any) => {
                return (
                  <div>
                    {item.symbol
                      ? `(${item.symbol}) ${item.localizedLabel} `
                      : item.localizedLabel}
                  </div>
                );
              }}
              onSelectionChange={(key, item) => handleBaseUomChange(key, item)}
            />
          </div>
          <div className="flex flex-col gap-1 justify-center flex-1">
            <p className="text-small text-default-500 italic break-words">
              {tProductForm("baseUomDescription")}
            </p>
            <p className="text-small text-danger-500 italic break-words">
              {tProductForm("baseUomWarning")}
            </p>
          </div>
        </div>

        {baseUomId && (
          <>
            <div className="flex gap-4">
              <div className="max-w-[900px] overflow-auto">
                <IBaseTable
                  columns={tableColumns}
                  dataSource={uomConversions}
                  emptyContent={tProductForm("noOtherUoms")}
                  isRefreshData={false}
                  isStriped={false}
                  pagination={false}
                  rowKey="uuid"
                  total={uomConversions.length}
                />
              </div>
              {canAddOtherUom && (
                <IBaseButton
                  color="primary"
                  isDisabled={isBusy || !baseUomId}
                  size="sm"
                  startContent={<Plus size={14} />}
                  variant="light"
                  onPress={handleAddNewUom}
                >
                  {tProductForm("addOtherUom")}
                </IBaseButton>
              )}
            </div>

            {hasFeatureUoms && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {featureUomConfigs.map((config) => (
                  <IBaseSingleSelect
                    key={config.key}
                    isDisabled={isBusy || !baseUomId}
                    items={availableUomOptions}
                    label={config.label}
                    selectedKey={config.value}
                    onSelectionChange={(key, item) => {
                      const fieldPath = `variants.${variantIndex}.${config.fieldName}`;

                      if (!key) {
                        setValue(fieldPath, undefined, {
                          shouldDirty: true,
                          shouldValidate: false,
                        });

                        return;
                      }
                      const name =
                        typeof item?.label === "string"
                          ? item.label
                          : item?.label?.vi || item?.label?.en || "";

                      setValue(
                        fieldPath,
                        { id: key, name },
                        {
                          shouldDirty: true,
                          shouldValidate: false,
                        },
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirm IBaseModal */}
      <IBaseModal
        isOpen={deleteConfirmModal.isOpen}
        placement="center"
        onClose={() => setDeleteConfirmModal({ isOpen: false })}
      >
        <IBaseModalContent>
          <IBaseModalHeader>
            {tProductForm("uom-section.confirmDeleteUom")}
          </IBaseModalHeader>
          <IBaseModalBody>
            <p>
              {tProductForm("uom-section.confirmDeleteUomMessage")}
              {deleteConfirmModal.uomName && ` (${deleteConfirmModal.uomName})`}
            </p>
          </IBaseModalBody>
          <IBaseModalFooter>
            <IBaseButton
              variant="light"
              onPress={() => setDeleteConfirmModal({ isOpen: false })}
            >
              {t("actions.cancel")}
            </IBaseButton>
            <IBaseButton color="danger" onPress={confirmDelete}>
              {t("actions.delete")}
            </IBaseButton>
          </IBaseModalFooter>
        </IBaseModalContent>
      </IBaseModal>
    </>
  );
}
