"use client";

import {
  DataTable,
  IBaseInputNumber,
  IBaseSingleSelect,
  SelectItemOption,
} from "@base/client/components";
import {
  DATA_TABLE_COLUMN_KEY_ACTION,
  type DataTableColumnDefinition,
} from "@base/client/components/DataTable/DataTableInterface";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { addToast } from "@heroui/react";
import { Plus, Trash } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useState } from "react";
import type { OtherUom } from "../../hooks/useProductUoms";
import { useProductUoms } from "../../hooks/useProductUoms";
import {
  ProductMasterFeatures,
  ProductMasterFeaturesType,
} from "../../interface/Product";

type UomSectionProps = {
  baseUomId?: string;
  masterFeatures: Record<ProductMasterFeaturesType, boolean>;
  uomOptions: SelectItemOption[];
  uomQueryLoading: boolean;
  isBusy: boolean;
  error?: { message?: string };
  onBaseUomChange: (baseUomId: string | undefined) => void;
};

export default function UomSection({
  baseUomId,
  masterFeatures,
  uomOptions,
  uomQueryLoading,
  isBusy,
  error,
  onBaseUomChange,
}: UomSectionProps) {
  const tProduct = useTranslations("mdl-product");
  const tProductForm = useTranslations("mdl-product.product-create");
  const t = useTranslations("common");

  const {
    othersUoms,
    updateUom,
    updateConversionRatio,
    resetUom,
    removeUom,
    addOtherUom,
    canAddOtherUom,
  } = useProductUoms({ masterFeatures });

  const [duplicateModal, setDuplicateModal] = useState<{
    isOpen: boolean;
    duplicateLabel?: string;
  }>({ isOpen: false });

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    uomId?: string;
    uomName?: string;
  }>({ isOpen: false });

  // State for Sale/Purchase/MRP UOMs
  const [saleUomId, setSaleUomId] = useState<string | undefined>();
  const [purchaseUomId, setPurchaseUomId] = useState<string | undefined>();
  const [mrpUomId, setMrpUomId] = useState<string | undefined>();

  // Filter othersUoms to only "other" type for table
  const otherUomsForTable = useMemo(() => {
    return othersUoms.filter((uom) => uom.type === "other");
  }, [othersUoms]);

  // Build available UOM options for Sale/Purchase/MRP (baseUomId + othersUoms)
  const availableUomOptions = useMemo(() => {
    if (!baseUomId) return [];

    const baseUomOption = uomOptions.find((opt) => opt.value === baseUomId);
    const otherUomOptions = othersUoms
      .filter((uom) => uom.uomId !== null)
      .map((uom) => {
        const option = uomOptions.find((opt) => opt.value === uom.uomId);
        return option;
      })
      .filter((opt): opt is SelectItemOption => opt !== undefined);

    const options: SelectItemOption[] = [];
    if (baseUomOption) {
      options.push(baseUomOption);
    }
    options.push(...otherUomOptions);

    return options;
  }, [baseUomId, uomOptions, othersUoms]);

  // Handle UOM selection with duplicate check
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

      // Check if UOM is duplicate

      const uomIds = [...othersUoms.map((uom) => uom.uomId), baseUomId];
      if (uomIds.includes(selectedUomId)) {
        setDuplicateModal({
          isOpen: true,
          duplicateLabel: selectedUomName ?? undefined,
        });
        return;
      }

      // Update UOM
      const result = updateUom(
        uuid,
        selectedUomId,
        selectedUomName || "",
        baseUomId
      );
    },
    [baseUomId, othersUoms, uomOptions, updateUom, resetUom, setDuplicateModal]
  );

  // Handle delete UOM
  const handleDeleteUom = useCallback(
    (uuid: string) => {
      const uom = othersUoms.find((u) => u.uuid === uuid);
      if (uom) {
        setDeleteConfirmModal({
          isOpen: true,
          uomId: uuid,
          uomName: uom.uomName || uom.label,
        });
      }
    },
    [othersUoms, setDeleteConfirmModal]
  );

  // Confirm delete
  const confirmDelete = useCallback(() => {
    if (deleteConfirmModal.uomId) {
      removeUom(deleteConfirmModal.uomId);

      setDeleteConfirmModal({ isOpen: false });
    }
  }, [deleteConfirmModal.uomId, removeUom, setDeleteConfirmModal]);

  // Handle add new UOM
  const handleAddNewUom = useCallback(() => {
    addOtherUom();
  }, [addOtherUom]);

  // Handler for conversion ratio change
  const handleConversionRatioChange = useCallback(
    (uuid: string) => (ratio: number | null | undefined) => {
      updateConversionRatio(uuid, ratio ?? null);
    },
    [updateConversionRatio]
  );

  // Build table columns
  const tableColumns: DataTableColumnDefinition<OtherUom>[] = useMemo(() => {
    const columns: DataTableColumnDefinition<OtherUom>[] = [
      {
        key: "uom",
        title: tProductForm("otherUnitOfMeasure") || "UOM",
        width: 300,
        render: (_, record) => {
          return (
            <IBaseSingleSelect
              aria-label={tProductForm("otherUnitOfMeasure") || "UOM"}
              items={uomOptions.filter(
                (opt) =>
                  opt.value !== baseUomId &&
                  !othersUoms.some(
                    (uom) => uom.uuid !== record.uuid && uom.uomId === opt.value
                  )
              )}
              selectedKey={record.uomId || undefined}
              onSelectionChange={(key, item) => {
                handleUomSelection(
                  record.uuid,
                  key ?? null,
                  item?.label ?? null
                );
              }}
              isLoading={uomQueryLoading}
              isDisabled={isBusy || uomQueryLoading || !baseUomId}
              size="sm"
              variant="bordered"
            />
          );
        },
      },
      {
        key: "conversionRatio",
        title:
          tProductForm("uom-section.conversionRatio") || "Conversion Ratio",
        width: 200,
        render: (_, record) => {
          return (
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
          );
        },
      },
    ];

    // Add Action column
    columns.push({
      key: DATA_TABLE_COLUMN_KEY_ACTION,
      title: t("actions.action"),
      width: 80,
      align: "end",
      render: (_, record) => {
        return (
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
        );
      },
    });

    return columns;
  }, [
    tProductForm,
    t,
    masterFeatures,
    uomOptions,
    baseUomId,
    othersUoms,
    otherUomsForTable,
    uomQueryLoading,
    isBusy,
    handleUomSelection,
    handleDeleteUom,
    handleConversionRatioChange,
    availableUomOptions,
    saleUomId,
    purchaseUomId,
    mrpUomId,
    setSaleUomId,
    setPurchaseUomId,
    setMrpUomId,
  ]);

  const isStockable = masterFeatures[ProductMasterFeatures.STOCKABLE];

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-medium font-medium">
              {tProductForm("unitOfMeasure")}
            </h4>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-[400px]">
            <IBaseSingleSelect
              label={
                tProductForm("baseUnitOfMeasure") +
                (isStockable ? " (Stockable)" : "")
              }
              items={uomOptions}
              selectedKey={baseUomId}
              onSelectionChange={(key) => {
                // check duplicate in otherUomsForTable
                const duplicate = otherUomsForTable.find(
                  (uom) => uom.uomId === key
                );
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
                    if (masterFeatures[ProductMasterFeatures.SALE]) {
                      setSaleUomId(key);
                    }
                    if (masterFeatures[ProductMasterFeatures.PURCHASE]) {
                      setPurchaseUomId(key);
                    }
                    if (masterFeatures[ProductMasterFeatures.MANUFACTURE]) {
                      setMrpUomId(key);
                    }
                  }, 100);
                }
              }}
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
        <div className="flex flex-col gap-4">
          {baseUomId && (
            <>
              <div className="flex j">
                <div className="max-w-[900px] overflow-auto">
                  <DataTable
                    columns={tableColumns}
                    dataSource={otherUomsForTable}
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
                  <div className="flex justify-start">
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
                  </div>
                )}
              </div>

              {/* Sale/Purchase/MRP UOM Selection */}
              {(masterFeatures[ProductMasterFeatures.SALE] ||
                masterFeatures[ProductMasterFeatures.PURCHASE] ||
                masterFeatures[ProductMasterFeatures.MANUFACTURE]) && (
                <div className="grid grid-cols-3 gap-4 mt-4">
                  {masterFeatures[ProductMasterFeatures.SALE] && (
                    <IBaseSingleSelect
                      label={tProduct("productFeature.sale") || "Sale UOM"}
                      items={availableUomOptions}
                      selectedKey={saleUomId}
                      onSelectionChange={(key) => {
                        console.log("key", key);
                        setSaleUomId(key);
                      }}
                      isLoading={uomQueryLoading}
                      isDisabled={isBusy || uomQueryLoading || !baseUomId}
                    />
                  )}
                  {masterFeatures[ProductMasterFeatures.PURCHASE] && (
                    <IBaseSingleSelect
                      label={
                        tProduct("productFeature.purchase") || "Purchase UOM"
                      }
                      items={availableUomOptions}
                      selectedKey={purchaseUomId}
                      onSelectionChange={(key) => {
                        setPurchaseUomId(key);
                      }}
                      isLoading={uomQueryLoading}
                      isDisabled={isBusy || uomQueryLoading || !baseUomId}
                    />
                  )}
                  {masterFeatures[ProductMasterFeatures.MANUFACTURE] && (
                    <IBaseSingleSelect
                      label={
                        tProduct("productFeature.manufacture") || "MRP UOM"
                      }
                      items={availableUomOptions}
                      selectedKey={mrpUomId}
                      onSelectionChange={(key) => {
                        setMrpUomId(key);
                      }}
                      isLoading={uomQueryLoading}
                      isDisabled={isBusy || uomQueryLoading || !baseUomId}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Duplicate Warning Modal */}
      <Modal
        isOpen={duplicateModal.isOpen}
        onClose={() => setDuplicateModal({ isOpen: false })}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            {tProductForm("duplicateUomTitle") || "Duplicate UOM"}
          </ModalHeader>
          <ModalBody>
            <p>
              {tProductForm("duplicateUomMessage") ||
                "This UOM is already selected in another field"}
              {duplicateModal.duplicateLabel &&
                ` (${duplicateModal.duplicateLabel})`}
              .
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onPress={() => setDuplicateModal({ isOpen: false })}
            >
              {t("ok") || "OK"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

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
