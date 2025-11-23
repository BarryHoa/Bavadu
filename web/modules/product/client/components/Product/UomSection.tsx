"use client";

import {
  IBaseInput,
  IBaseSelectWithSearch,
  SelectItemOption,
} from "@base/client/components";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
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

  // Store previous UOM values for each field to revert on duplicate
  const previousUomValues = useRef<Map<string, string | null>>(new Map());

  // render othersUoms
  const renderOthersUoms = () => {
    return othersUoms.map((uom) => {
      // Store current value as previous if not already stored
      if (!previousUomValues.current.has(uom.uuid)) {
        previousUomValues.current.set(uom.uuid, uom.uomId);
      }

      return (
        <div key={uom.uuid} className="flex gap-4 items-center">
          <div className="w-[400px]">
            <IBaseSelectWithSearch
              key={`${uom.uuid}-${uom.uomId}`} // Force re-render on revert
              label={uom.label}
              items={uomOptions}
              selectedKeys={uom.uomId ? [uom.uomId] : []}
              onSelectionChange={(keys) => {
                const keySet = keys as Set<string>;
                const [first] = Array.from(keySet);
                const selectedUom = uomOptions.find(
                  (item) => item.value === first
                );

                if (selectedUom) {
                  const result = updateUom(
                    uom.uuid,
                    selectedUom.value,
                    selectedUom.label,
                    baseUomId
                  );

                  if (result.isDuplicate) {
                    // Revert to previous value
                    const previousValue = previousUomValues.current.get(
                      uom.uuid
                    );
                    if (previousValue) {
                      const prevUom = uomOptions.find(
                        (item) => item.value === previousValue
                      );
                      if (prevUom) {
                        updateUom(
                          uom.uuid,
                          prevUom.value,
                          prevUom.label,
                          baseUomId
                        );
                      }
                    } else {
                      resetUom(uom.uuid);
                    }

                    // Show modal
                    setDuplicateModal({
                      isOpen: true,
                      duplicateLabel: result.duplicateLabel,
                    });
                  } else {
                    // Update previous value on success
                    previousUomValues.current.set(uom.uuid, selectedUom.value);
                  }
                } else {
                  // If cleared, reset UOM and clear previous value
                  resetUom(uom.uuid);
                  previousUomValues.current.set(uom.uuid, null);
                }
              }}
              isLoading={uomQueryLoading}
              isDisabled={isBusy || uomQueryLoading || !baseUomId}
            />
          </div>
          <div className="w-[250px]">
            <IBaseInput
              type="number"
              min={0}
              step={0.0001}
              label={"Giá trị chuyển đổi"}
              value={uom.conversionRatio.toString()}
              onValueChange={(next) => {
                // Ensure only valid number and positive
                const ratio = Number(next);
                updateConversionRatio(uom.uuid, ratio);
              }}
              isDisabled={isBusy || !baseUomId}
            />
          </div>
          <Button
            isIconOnly
            variant="ghost"
            aria-label={tProduct("deleteUom")}
            isDisabled={isBusy || !baseUomId}
            color="danger"
            onPress={() => {
              // If it's "other" type, remove it completely; otherwise just reset
              if (uom.type === "other") {
                removeUom(uom.uuid);
              } else {
                resetUom(uom.uuid);
              }
            }}
            className="h-4 w-4 p-0 min-w-4 rounded-full mt-5 cursor-pointer"
          >
            <span className="sr-only">{tProduct("deleteUom")}</span>
            <X size={14} />
          </Button>
        </div>
      );
    });
  };
  const isStockable = masterFeatures[ProductMasterFeatures.STOCKABLE];

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-medium font-medium">
              {tProduct("unitOfMeasure")}
            </h4>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-[400px]">
            <IBaseSelectWithSearch
              label={
                tProduct("baseUnitOfMeasure") +
                (isStockable ? " (Stockable)" : "")
              }
              items={uomOptions}
              selectedKeys={baseUomId ? [baseUomId] : []}
              onSelectionChange={(keys) => {
                const keySet = keys as Set<string>;
                const [first] = Array.from(keySet);
                const nextValue =
                  typeof first === "string" && first.length > 0
                    ? first
                    : undefined;
                onBaseUomChange(nextValue);
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
              {tProduct("baseUomDescription")}
            </p>
            <p className="text-small text-danger-500 italic break-words">
              {tProduct("baseUomWarning")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {renderOthersUoms()}
          <div className="flex justify-start">
            {canAddOtherUom() && baseUomId && (
              <Button
                size="sm"
                variant="light"
                color="primary"
                startContent={<Plus size={14} />}
                onPress={addOtherUom}
                isDisabled={isBusy || !baseUomId}
              >
                {tProduct("addOtherUom")}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={duplicateModal.isOpen}
        onClose={() => setDuplicateModal({ isOpen: false })}
        placement="center"
      >
        <ModalContent>
          <ModalHeader>
            {tProduct("duplicateUomTitle") || "Duplicate UOM"}
          </ModalHeader>
          <ModalBody>
            <p>
              {tProduct("duplicateUomMessage") ||
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
    </>
  );
}
