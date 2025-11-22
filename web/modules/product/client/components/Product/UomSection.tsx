"use client";

import {
  IBaseInput,
  IBaseSelectWithSearch,
  SelectItemOption,
} from "@base/client/components";
import { Button } from "@heroui/button";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { uuidv7 } from "uuidv7";
import {
  ProductMasterFeatures,
  ProductMasterFeaturesType,
} from "../../interface/Product";

type OtherUom = {
  uomId: string | null;
  uomName: string | null;
  label: string;
  type: ProductMasterFeaturesType | "other";
  uuid: string;
  isActive: boolean;
  conversionRatio: number;
};

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

  const [othersUoms, setOthersUoms] = useState<OtherUom[]>([]);

  useEffect(() => {
    // reset othersUoms
    // sort
    const sortKeys = [
      ProductMasterFeatures.SALE,
      ProductMasterFeatures.PURCHASE,
      ProductMasterFeatures.MANUFACTURE,
    ];
    const othersUoms = sortKeys
      .filter((key: ProductMasterFeaturesType) => masterFeatures[key] === true)
      .map((key: ProductMasterFeaturesType) => ({
        type: key,
        label: tProduct(`productFeature.${key}`),
        uomId: null,
        uomName: null,
        uuid: uuidv7(),
        isActive: true,
        conversionRatio: 1,
      }));
    setOthersUoms(othersUoms);
  }, [masterFeatures]);

  // render othersUoms
  const renderOthersUoms = () => {
    return othersUoms.map((uom) => (
      <div key={uom.uuid} className="flex gap-4 items-center">
        <div className="w-[400px]">
          <IBaseSelectWithSearch
            label={uom.label}
            items={uomOptions}
            selectedKeys={uom.uomId ? [uom.uomId] : []}
            onSelectionChange={(keys) => {
              const keySet = keys as Set<string>;
              const [first] = Array.from(keySet);
              const selectedUom = uomOptions.find(
                (item) => item.value === first
              );

              setOthersUoms((prev) =>
                prev.map((item) =>
                  item.uuid === uom.uuid
                    ? {
                        ...item,
                        uomId: selectedUom?.value || "",
                        uomName: selectedUom?.label || "",
                      }
                    : item
                )
              );
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
              setOthersUoms((prev) =>
                prev.map((item) =>
                  item.uuid === uom.uuid
                    ? { ...item, conversionRatio: ratio > 0 ? ratio : 1 }
                    : item
                )
              );
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
            setOthersUoms((prev) =>
              prev.map((item) =>
                item.uuid === uom.uuid
                  ? { ...item, uomId: null, uomName: "" }
                  : item
              )
            );
          }}
          className="h-4 w-4 p-0 min-w-4 rounded-full mt-5 cursor-pointer" // 36px = 9 * 4
        >
          <span className="sr-only">{tProduct("deleteUom")}</span>
          <X size={14} />
        </Button>
      </div>
    ));
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
        {othersUoms.length > 0 && (
          <div className="flex flex-col gap-4">{renderOthersUoms()}</div>
        )}
      </div>
    </>
  );
}
