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
} from "@base/client/components/DataTable/DataTableInterface";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/react";
import { Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useProductUoms } from "../../hooks/useProductUoms";
import {
  ProductMasterFeatures,
  ProductMasterFeaturesType,
} from "../../interface/Product";
import { UomConversions } from "./types";

type UomSectionProps = {
  baseUomId?: string;
  saleUomId?: string;
  purchaseUomId?: string;
  manufacturingUomId?: string;
  uomConversions?: UomConversions[];
  masterFeatures: Record<ProductMasterFeaturesType, boolean>;
  uomOptions: SelectItemOption[];
  uomQueryLoading: boolean;
  isBusy: boolean;
  error?: { message?: string };
  onBaseUomChange: (baseUomId: string | undefined) => void;
  onSaleUomChange?: (saleUomId: string | undefined) => void;
  onPurchaseUomChange?: (purchaseUomId: string | undefined) => void;
  onManufacturingUomChange?: (manufacturingUomId: string | undefined) => void;
  onUomConversionsChange?: (uomConversions: UomConversions[]) => void;
};

// Helper: Notify parent of uomConversions change
const notifyUomConversionsChange = (
  onUomConversionsChange: ((uoms: UomConversions[]) => void) | undefined,
  updated: UomConversions[]
) => {
  if (onUomConversionsChange) {
    setTimeout(() => onUomConversionsChange(updated), 0);
  }
};

export default function UomSection({
  baseUomId,
  saleUomId: saleUomIdProp,
  purchaseUomId: purchaseUomIdProp,
  manufacturingUomId: manufacturingUomIdProp,
  uomConversions: uomConversionsProp,
  masterFeatures,
  uomOptions,
  uomQueryLoading,
  isBusy,
  error,
  onBaseUomChange,
  onSaleUomChange,
  onPurchaseUomChange,
  onManufacturingUomChange,
  onUomConversionsChange,
}: UomSectionProps) {
  const tProduct = useTranslations("mdl-product");
  const tProductForm = useTranslations("mdl-product.product-create");
  const t = useTranslations("common");

  const {
    uomConversions: hookUomConversions,
    updateUom,
    updateConversionRatio,
    resetUom,
    removeUom,
    addOtherUom,
    canAddOtherUom,
    setUomConversionsData,
  } = useProductUoms({ masterFeatures });

  // Sync hook with prop
  useEffect(() => {
    if (uomConversionsProp) {
      const propUuids = JSON.stringify(
        uomConversionsProp.map((u) => u.uuid).sort()
      );
      const hookUuids = JSON.stringify(
        hookUomConversions.map((u) => u.uuid).sort()
      );
      if (propUuids !== hookUuids) {
        setUomConversionsData(uomConversionsProp);
      }
    }
  }, [uomConversionsProp, hookUomConversions, setUomConversionsData]);

  const uomConversions = uomConversionsProp || hookUomConversions;

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    uuid?: string;
    uomName?: string;
  }>({ isOpen: false });

  // Filter "other" type for table
  const uomConversionsForTable = useMemo(
    () => uomConversions.filter((uom) => uom.type === "other"),
    [uomConversions]
  );

  // Build available UOM options (baseUomId + uomConversions)
  const availableUomOptions = useMemo(() => {
    if (!baseUomId) return [];

    const baseUomOption = uomOptions.find((opt) => opt.value === baseUomId);
    const conversionOptions = uomConversions
      .filter((uom) => uom.uomId !== null)
      .map((uom) => uomOptions.find((opt) => opt.value === uom.uomId))
      .filter((opt): opt is SelectItemOption => opt !== undefined);

    return baseUomOption
      ? [baseUomOption, ...conversionOptions]
      : conversionOptions;
  }, [baseUomId, uomOptions, uomConversions]);

  // Handle UOM selection
  const handleUomSelection = useCallback(
    (
      uuid: string,
      selectedUomId: string | null,
      selectedUomName: string | null
    ) => {
      if (!selectedUomId) {
        resetUom(uuid);
        return;
      }

      const uomIds = [...uomConversions.map((uom) => uom.uomId), baseUomId];
      if (uomIds.includes(selectedUomId)) {
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

      const result = updateUom(
        uuid,
        selectedUomId,
        selectedUomName || "",
        baseUomId
      );
      if (result.success) {
        const updated = hookUomConversions.map((uom) =>
          uom.uuid === uuid
            ? { ...uom, uomId: selectedUomId, uomName: selectedUomName || "" }
            : uom
        );
        notifyUomConversionsChange(onUomConversionsChange, updated);
      }
    },
    [
      baseUomId,
      uomConversions,
      updateUom,
      resetUom,
      hookUomConversions,
      onUomConversionsChange,
      // tProductForm - removed, translation functions are stable
    ]
  );

  // Handle delete
  const handleDeleteUom = useCallback(
    (uuid: string) => {
      const uom = uomConversions.find((u) => u.uuid === uuid);
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
      removeUom(deleteUuid);
      const updated = hookUomConversions.filter(
        (uom) => uom.uuid !== deleteUuid
      );
      notifyUomConversionsChange(onUomConversionsChange, updated);
      setDeleteConfirmModal({ isOpen: false });
    }
  }, [deleteUuid, removeUom, hookUomConversions, onUomConversionsChange]);

  // Handle add new UOM
  const handleAddNewUom = useCallback(() => {
    addOtherUom();
    if (onUomConversionsChange) {
      setTimeout(() => onUomConversionsChange([...hookUomConversions]), 100);
    }
  }, [addOtherUom, onUomConversionsChange, hookUomConversions]);

  // Handle conversion ratio change
  const handleConversionRatioChange = useCallback(
    (uuid: string) => (ratio: number | null | undefined) => {
      updateConversionRatio(uuid, ratio ?? null);
      const updated = hookUomConversions.map((uom) =>
        uom.uuid === uuid ? { ...uom, conversionRatio: ratio ?? null } : uom
      );
      notifyUomConversionsChange(onUomConversionsChange, updated);
    },
    [updateConversionRatio, hookUomConversions, onUomConversionsChange]
  );

  // Handle base UOM change
  const handleBaseUomChange = useCallback(
    (key: string | undefined) => {
      const duplicate = uomConversionsForTable.find((uom) => uom.uomId === key);
      if (duplicate) {
        addToast({
          title: tProductForm("duplicateUom"),
          description: tProductForm("duplicateUomDescription"),
          color: "warning",
        });
        return;
      }

      onBaseUomChange(key);

      // Auto-set SALE, PURCHASE, MANUFACTURE to base if not already selected
      if (key) {
        setTimeout(() => {
          if (
            masterFeatures[ProductMasterFeatures.SALE] &&
            onSaleUomChange &&
            !saleUomIdProp
          ) {
            onSaleUomChange(key);
          }
          if (
            masterFeatures[ProductMasterFeatures.PURCHASE] &&
            onPurchaseUomChange &&
            !purchaseUomIdProp
          ) {
            onPurchaseUomChange(key);
          }
          if (
            masterFeatures[ProductMasterFeatures.MANUFACTURE] &&
            onManufacturingUomChange &&
            !manufacturingUomIdProp
          ) {
            onManufacturingUomChange(key);
          }
        }, 100);
      }
    },
    [
      uomConversionsForTable,
      onBaseUomChange,
      masterFeatures,
      onSaleUomChange,
      onPurchaseUomChange,
      onManufacturingUomChange,
      saleUomIdProp,
      purchaseUomIdProp,
      manufacturingUomIdProp,
      // tProductForm - removed, translation functions are stable
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
              (opt) =>
                opt.value !== baseUomId &&
                !uomConversions.some(
                  (uom) => uom.uuid !== record.uuid && uom.uomId === opt.value
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
      // tProductForm, t - removed, translation functions are stable
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
          onChange: onSaleUomChange,
        },
        {
          key: ProductMasterFeatures.PURCHASE,
          label: tProduct("productFeature.purchase") || "Purchase UOM",
          value: purchaseUomIdProp,
          onChange: onPurchaseUomChange,
        },
        {
          key: ProductMasterFeatures.MANUFACTURE,
          label: tProduct("productFeature.manufacture") || "MRP UOM",
          value: manufacturingUomIdProp,
          onChange: onManufacturingUomChange,
        },
      ].filter((config) => masterFeatures[config.key]),
    [
      // tProduct - removed, translation functions are stable
      masterFeatures,
      saleUomIdProp,
      purchaseUomIdProp,
      manufacturingUomIdProp,
      onSaleUomChange,
      onPurchaseUomChange,
      onManufacturingUomChange,
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
                />
              </div>
              {canAddOtherUom() && (
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
                    onSelectionChange={config.onChange}
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
