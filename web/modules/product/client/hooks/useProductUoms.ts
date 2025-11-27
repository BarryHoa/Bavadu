import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { uuidv7 } from "uuidv7";
import type { UomConversions } from "../components/Product/types";
import {
  ProductMasterFeatures,
  ProductMasterFeaturesType,
} from "../interface/Product";

// Re-export UomConversions type for backward compatibility
export type { UomConversions } from "../components/Product/types";

// Legacy type alias - use UomConversions instead
export type OtherUom = UomConversions;

type UseProductUomsOptions = {
  masterFeatures: Record<ProductMasterFeaturesType, boolean>;
};

export const useProductUoms = ({ masterFeatures }: UseProductUomsOptions) => {
  const tProduct = useTranslations("mdl-product");
  const [uomConversions, setUomConversions] = useState<UomConversions[]>([]);

  // Initialize uomConversions based on masterFeatures
  useEffect(() => {
    const sortKeys = [
      ProductMasterFeatures.SALE,
      ProductMasterFeatures.PURCHASE,
      ProductMasterFeatures.MANUFACTURE,
    ];

    const newUomConversions = sortKeys
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

    setUomConversions(newUomConversions);
  }, [masterFeatures, tProduct]);

  // Check if UOM is duplicate based on type
  // Rules:
  // - baseUnit, sale, purchase, manufacture can duplicate with each other
  // - "other" cannot duplicate with baseUnit, sale, purchase, manufacture, or other "other" UOMs
  const isDuplicateUom = (
    uomId: string,
    currentUuid: string,
    currentType: ProductMasterFeaturesType | "other",
    baseUomId?: string
  ): { isDuplicate: boolean; duplicateLabel?: string } => {
    const currentUom = uomConversions.find((uom) => uom.uuid === currentUuid);

    // If current type is "other", check against everything
    if (currentType === "other") {
      // Check against baseUomId
      if (baseUomId && uomId === baseUomId) {
        return { isDuplicate: true, duplicateLabel: "Base UOM" };
      }

      // Check against all other UOMs (sale, purchase, manufacture, and other "other" UOMs)
      const duplicate = uomConversions.find(
        (uom) => uom.uomId === uomId && uom.uuid !== currentUuid
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
        (uom) =>
          uom.type === "other" &&
          uom.uomId === uomId &&
          uom.uuid !== currentUuid
      );

      if (duplicateOther) {
        return { isDuplicate: true, duplicateLabel: duplicateOther.label };
      }
    }

    return { isDuplicate: false };
  };

  // Update UOM selection with duplicate check
  const updateUom = (
    uuid: string,
    uomId: string,
    uomName: string,
    baseUomId?: string
  ): { success: boolean; isDuplicate: boolean; duplicateLabel?: string } => {
    const currentUom = uomConversions.find((uom) => uom.uuid === uuid);
    if (!currentUom) {
      return { success: false, isDuplicate: false };
    }

    const duplicateCheck = isDuplicateUom(
      uomId,
      uuid,
      currentUom.type,
      baseUomId
    );

    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        isDuplicate: true,
        duplicateLabel: duplicateCheck.duplicateLabel,
      };
    }

    setUomConversions((prev) =>
      prev.map((item) =>
        item.uuid === uuid
          ? {
              ...item,
              uomId,
              uomName,
            }
          : item
      )
    );

    return { success: true, isDuplicate: false };
  };

  // Update conversion ratio
  const updateConversionRatio = (uuid: string, ratio: number | null) => {
    setUomConversions((prev) =>
      prev.map((item) =>
        item.uuid === uuid ? { ...item, conversionRatio: ratio } : item
      )
    );
  };

  // Reset UOM (clear selection)
  const resetUom = (uuid: string) => {
    setUomConversions((prev) =>
      prev.map((item) =>
        item.uuid === uuid ? { ...item, uomId: null, uomName: null } : item
      )
    );
  };

  // Remove UOM (delete from list)
  const removeUom = (uuid: string) => {
    setUomConversions((prev) => prev.filter((item) => item.uuid !== uuid));
  };

  // Add other UOM (max 9 total)
  const addOtherUom = () => {
    const MAX_OTHER_UOMS = 9;
    setUomConversions((prev) => {
      // Count only "other" type UOMs
      const uomConversionsCount = prev.filter(
        (uom) => uom.type === "other"
      ).length;

      if (uomConversionsCount >= MAX_OTHER_UOMS) {
        return prev;
      }

      return [
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
      ];
    });
  };

  // Get all UOMs data
  const getUomConversions = () => uomConversions;

  // Set UOMs data (for initial values or external updates)
  const setUomConversionsData = (uoms: UomConversions[]) => {
    setUomConversions(uoms);
  };

  // Check if can add more UOMs
  const canAddOtherUom = () => {
    const MAX_OTHER_UOMS = 9;
    const uomConversionsCount = uomConversions.filter(
      (uom) => uom.type === "other"
    ).length;
    return uomConversionsCount < MAX_OTHER_UOMS;
  };

  return {
    uomConversions,
    updateUom,
    updateConversionRatio,
    resetUom,
    removeUom,
    addOtherUom,
    canAddOtherUom,
    getUomConversions,
    setUomConversionsData,
  };
};
