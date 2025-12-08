"use client";

import {
  DataTable,
  IBaseInputNumber,
  IBaseSingleSelect,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  SelectItemOption,
} from "@base/client/components";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  type DataTableColumnDefinition,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/react";
import { Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { uuidv7 } from "uuidv7";
import {
  ProductMasterFeatures,
  ProductMasterFeaturesType,
} from "../../interface/Product";
import { UomConversions } from "./types";

type UomSectionProps = {
  variantIndex: number;
  masterFeatures: Record<ProductMasterFeaturesType, boolean>;
  uomOptions: SelectItemOption[];
  uomQueryLoading: boolean;
  isBusy: boolean;
  error?: { message?: string };
};

export default function UomSection({
  variantIndex,
  masterFeatures,
  uomOptions,
  uomQueryLoading,
  isBusy,
  error,
}: UomSectionProps) {
  const tProduct = useTranslations("mdl-product");
  const tProductForm = useTranslations("mdl-product.product-create");
  const t = useTranslations("common");

  const { setValue } = useFormContext();

  // Watch form values directly
  const baseUomId = useWatch({ name: `variants.${variantIndex}.baseUomId` });
  const saleUomIdProp = useWatch({
    name: `variants.${variantIndex}.saleUomId`,
  });
  const purchaseUomIdProp = useWatch({
    name: `variants.${variantIndex}.purchaseUomId`,
  });
  const manufacturingUomIdProp = useWatch({
    name: `variants.${variantIndex}.manufacturingUomId`,
  });
  const uomConversions = useWatch({
    name: `variants.${variantIndex}.uomConversions`,
  });

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
      baseUomId?: string
    ): { isDuplicate: boolean; duplicateLabel?: string } => {
      const currentUom = uomConversions.find(
        (uom: UomConversions) => uom.uuid === currentUuid
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
            uom.uomId === uomId && uom.uuid !== currentUuid
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
            uom.uuid !== currentUuid
        );

        if (duplicateOther) {
          return { isDuplicate: true, duplicateLabel: duplicateOther.label };
        }
      }

      return { isDuplicate: false };
    },
    [uomConversions]
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
    [uomConversions, variantIndex, setValue]
  );

  // Filter "other" type for table
  const uomConversionsForTable = useMemo(
    () => uomConversions.filter((uom: UomConversions) => uom.type === "other"),
    [uomConversions]
  );

  // Build available UOM options (baseUomId + uomConversions)
  const availableUomOptions = useMemo(() => {
    if (!baseUomId) return [];

    const baseUomOption = uomOptions.find((opt) => opt.value === baseUomId);
    const conversionOptions = uomConversions
      .filter((uom: UomConversions) => uom.uomId !== null)
      .map((uom: UomConversions) =>
        uomOptions.find((opt: SelectItemOption) => opt.value === uom.uomId)
      )
      .filter(
        (opt: SelectItemOption | undefined): opt is SelectItemOption =>
          opt !== undefined
      );

    return baseUomOption
      ? [baseUomOption, ...conversionOptions]
      : conversionOptions;
  }, [baseUomId, uomOptions, uomConversions]);

  // Check if can add more UOMs
  const canAddOtherUom = useMemo(() => {
    const MAX_OTHER_UOMS = 9;
    const uomConversionsCount = uomConversions.filter(
      (uom: UomConversions) => uom.type === "other"
    ).length;
    return uomConversionsCount < MAX_OTHER_UOMS;
  }, [uomConversions]);

  // Handle UOM selection
  const handleUomSelection = useCallback(
    (
      uuid: string,
      selectedUomId: string | null,
      selectedUomName: string | null
    ) => {
      if (!selectedUomId) {
        // Reset UOM
        updateUomConversions((prev) =>
          prev.map((item) =>
            item.uuid === uuid ? { ...item, uomId: null, uomName: null } : item
          )
        );
        return;
      }

      const currentUom = uomConversions.find(
        (uom: UomConversions) => uom.uuid === uuid
      );
      if (!currentUom) {
        return;
      }

      // Check for duplicates
      const duplicateCheck = isDuplicateUom(
        selectedUomId,
        uuid,
        currentUom.type,
        baseUomId
      );

      if (duplicateCheck.isDuplicate) {
        addToast({
          title: tProductForm("duplicateUom"),
          description:
            tProductForm("duplicateUomMessage") ||
            "This UOM is already selected in another field" +
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
            : item
        )
      );
    },
    [
      baseUomId,
      uomConversions,
      isDuplicateUom,
      updateUomConversions,
      tProductForm,
    ]
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
    [uomConversions]
  );

  const deleteUuid = deleteConfirmModal.uuid;
  const confirmDelete = useCallback(() => {
    if (deleteUuid) {
      updateUomConversions((prev) =>
        prev.filter((item) => item.uuid !== deleteUuid)
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
        label: tProduct("otherUnitOfMeasure") || "Other",
        uomId: null,
        uomName: null,
        uuid: uuidv7(),
        isActive: true,
        conversionRatio: 1,
      },
    ]);
  }, [canAddOtherUom, updateUomConversions, tProduct]);

  // Handle conversion ratio change
  const handleConversionRatioChange = useCallback(
    (uuid: string) => (ratio: number | null | undefined) => {
      updateUomConversions((prev) =>
        prev.map((item) =>
          item.uuid === uuid
            ? { ...item, conversionRatio: ratio ?? null }
            : item
        )
      );
    },
    [updateUomConversions]
  );

  // Handle base UOM change
  const handleBaseUomChange = useCallback(
    (key: string | undefined) => {
      const duplicate = uomConversionsForTable.find(
        (uom: UomConversions) => uom.uomId === key
      );
      if (duplicate) {
        addToast({
          title: tProductForm("duplicateUom"),
          description: tProductForm("duplicateUomDescription"),
          color: "warning",
        });
        return;
      }

      setValue(`variants.${variantIndex}.baseUomId`, key, {
        shouldDirty: true,
        shouldValidate: false,
      });

      // Auto-set SALE, PURCHASE, MANUFACTURE to base if not already selected
      if (key) {
        setTimeout(() => {
          if (masterFeatures[ProductMasterFeatures.SALE] && !saleUomIdProp) {
            setValue(`variants.${variantIndex}.saleUomId`, key, {
              shouldDirty: true,
              shouldValidate: false,
            });
          }
          if (
            masterFeatures[ProductMasterFeatures.PURCHASE] &&
            !purchaseUomIdProp
          ) {
            setValue(`variants.${variantIndex}.purchaseUomId`, key, {
              shouldDirty: true,
              shouldValidate: false,
            });
          }
          if (
            masterFeatures[ProductMasterFeatures.MANUFACTURE] &&
            !manufacturingUomIdProp
          ) {
            setValue(`variants.${variantIndex}.manufacturingUomId`, key, {
              shouldDirty: true,
              shouldValidate: false,
            });
          }
        }, 100);
      }
    },
    [
      uomConversionsForTable,
      variantIndex,
      setValue,
      masterFeatures,
      saleUomIdProp,
      purchaseUomIdProp,
      manufacturingUomIdProp,
      tProductForm,
    ]
  );

  // Build table columns
  const tableColumns: DataTableColumnDefinition<UomConversions>[] = useMemo(
    () => [
      {
        key: "uom",
        title: tProductForm("otherUnitOfMeasure") || "UOM",
        width: 300,
        render: (_, record) => (
          <IBaseSingleSelect
            aria-label={tProductForm("otherUnitOfMeasure") || "UOM"}
            items={uomOptions.filter(
              (opt: SelectItemOption) =>
                opt.value !== baseUomId &&
                !uomConversions.some(
                  (uom: UomConversions) =>
                    uom.uuid !== record.uuid && uom.uomId === opt.value
                )
            )}
            selectedKey={record.uomId || undefined}
            onSelectionChange={(key, item) =>
              handleUomSelection(record.uuid, key ?? null, item?.label ?? null)
            }
            isLoading={uomQueryLoading}
            isDisabled={isBusy || uomQueryLoading || !baseUomId}
            size="sm"
            variant="bordered"
          />
        ),
      },
      {
        key: "conversionRatio",
        title:
          tProductForm("uom-section.conversionRatio") || "Conversion Ratio",
        width: 200,
        render: (_, record) => (
          <IBaseInputNumber
            id={`conversion-ratio-${record.uuid}`}
            key={`conversion-ratio-${record.uuid}`}
            min={0.0001}
            max={10000}
            decimalPlaces={4}
            value={record.conversionRatio}
            onValueChange={handleConversionRatioChange(record.uuid)}
            isDisabled={isBusy || !baseUomId}
            size="sm"
          />
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        title: t("actions.action"),
        width: 80,
        align: "end",
        render: (_, record) => (
          <Button
            isIconOnly
            variant="ghost"
            aria-label={tProductForm("deleteUom")}
            isDisabled={isBusy || !baseUomId}
            color="danger"
            size="sm"
            onPress={() => handleDeleteUom(record.uuid)}
          >
            <Trash size={14} />
          </Button>
        ),
      },
    ],
    [
      tProductForm,
      t,
      uomOptions,
      baseUomId,
      uomConversions,
      uomQueryLoading,
      isBusy,
      handleUomSelection,
      handleDeleteUom,
      handleConversionRatioChange,
    ]
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
          label: tProduct("productFeature.sale") || "Sale UOM",
          value: saleUomIdProp,
          fieldName: "saleUomId",
        },
        {
          key: ProductMasterFeatures.PURCHASE,
          label: tProduct("productFeature.purchase") || "Purchase UOM",
          value: purchaseUomIdProp,
          fieldName: "purchaseUomId",
        },
        {
          key: ProductMasterFeatures.MANUFACTURE,
          label: tProduct("productFeature.manufacture") || "MRP UOM",
          value: manufacturingUomIdProp,
          fieldName: "manufacturingUomId",
        },
      ].filter((config) => masterFeatures[config.key]),
    [
      tProduct,
      masterFeatures,
      saleUomIdProp,
      purchaseUomIdProp,
      manufacturingUomIdProp,
    ]
  );

  return (
    <>
      <div className="flex flex-col gap-4">
        <h4 className="text-medium font-medium">
          {tProductForm("unitOfMeasure")}
        </h4>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-[400px]">
            <IBaseSingleSelect
              label={
                tProductForm("baseUnitOfMeasure") +
                (isStockable ? " (Stockable)" : "")
              }
              items={uomOptions}
              selectedKey={baseUomId}
              onSelectionChange={handleBaseUomChange}
              isLoading={uomQueryLoading}
              isRequired
              isInvalid={Boolean(error)}
              errorMessage={error?.message}
              isDisabled={isBusy || uomQueryLoading}
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
                <DataTable
                  columns={tableColumns}
                  dataSource={uomConversionsForTable}
                  rowKey="uuid"
                  pagination={false}
                  emptyContent={
                    tProductForm("noOtherUoms") || "No other UOMs added yet"
                  }
                  isRefreshData={false}
                  isStriped={false}
                  total={uomConversionsForTable.length}
                />
              </div>
              {canAddOtherUom && (
                <Button
                  size="sm"
                  variant="light"
                  color="primary"
                  startContent={<Plus size={14} />}
                  onPress={handleAddNewUom}
                  isDisabled={isBusy || !baseUomId}
                >
                  {tProductForm("addOtherUom")}
                </Button>
              )}
            </div>

            {hasFeatureUoms && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {featureUomConfigs.map((config) => (
                  <IBaseSingleSelect
                    key={config.key}
                    label={config.label}
                    items={availableUomOptions}
                    selectedKey={config.value}
                    onSelectionChange={(key) => {
                      const fieldPath = `variants.${variantIndex}.${config.fieldName}`;
                      setValue(fieldPath, key ?? undefined, {
                        shouldDirty: true,
                        shouldValidate: false,
                      });
                    }}
                    isLoading={uomQueryLoading}
                    isDisabled={isBusy || uomQueryLoading || !baseUomId}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false })}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            {tProductForm("uom-section.confirmDeleteUom") ||
              "Confirm Delete UOM"}
          </ModalHeader>
          <ModalBody>
            <p>
              {tProductForm("uom-section.confirmDeleteUomMessage") ||
                "Are you sure you want to delete this UOM?"}
              {deleteConfirmModal.uomName && ` (${deleteConfirmModal.uomName})`}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="light"
              onPress={() => setDeleteConfirmModal({ isOpen: false })}
            >
              {t("cancel") || "Cancel"}
            </Button>
            <Button color="danger" onPress={confirmDelete}>
              {t("delete") || "Delete"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
