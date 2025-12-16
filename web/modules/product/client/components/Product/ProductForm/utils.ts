import type {
  ProductMasterFeatures,
  ProductMasterType,
} from "../../../interface/Product";
import type { ProductCategoryRow } from "../../../interface/ProductCategory";

import {
  FORBIDDEN_FEATURES_BY_TYPE,
  REQUIRED_FEATURES_BY_TYPE,
  getDefaultFeaturesForType,
} from "../../../utils/product-features-validator";

/**
 * Build hierarchy options for category select
 */
export const buildHierarchyOptions = (categories: ProductCategoryRow[]) => {
  const grouped = new Map<string | null, ProductCategoryRow[]>();

  categories.forEach((category) => {
    const parentKey = category.parent?.id ?? null;
    const siblings = grouped.get(parentKey) ?? [];

    siblings.push(category);
    grouped.set(parentKey, siblings);
  });

  const results: { id: string; label: string; level: number }[] = [];

  const traverse = (parentKey: string | null, depth: number) => {
    const nodes = grouped.get(parentKey);

    if (!nodes) return;

    nodes.forEach((node) => {
      const prefix = depth > 1 ? `${"―".repeat(depth - 1)} ` : "";
      const label = typeof node.name === "string" ? node.name : node.code;

      results.push({
        id: node.id,
        label: `${prefix}${label ?? node.id}`,
        level: depth,
      });
      traverse(node.id, depth + 1);
    });
  };

  traverse(null, 1);

  return results;
};

/**
 * Get features for a product type based on constraints
 * @param productType - The product type
 * @param featureOptions - Available feature options
 * @param currentFeatures - Current features state (optional)
 * @returns New features object with required/forbidden features applied
 */
export const getFeaturesByProductType = (
  productType: ProductMasterType,
  featureOptions: { value: string; label: string }[],
  currentFeatures?: Record<ProductMasterFeatures, boolean>,
): Record<ProductMasterFeatures, boolean> => {
  const defaultFeatures = getDefaultFeaturesForType(productType);
  const requiredFeatures = REQUIRED_FEATURES_BY_TYPE[productType] || [];
  const forbiddenFeatures = FORBIDDEN_FEATURES_BY_TYPE[productType] || [];

  return featureOptions.reduce(
    (acc, feature) => {
      const featureValue = feature.value as ProductMasterFeatures;

      // If feature is required, set to true
      if (requiredFeatures.includes(featureValue)) {
        acc[featureValue] = true;
      }
      // If feature is forbidden, set to false
      else if (forbiddenFeatures.includes(featureValue)) {
        acc[featureValue] = false;
      }
      // Otherwise, keep current value or use default
      else {
        acc[featureValue] =
          currentFeatures?.[featureValue] ??
          defaultFeatures[featureValue] ??
          false;
      }

      return acc;
    },
    {} as Record<ProductMasterFeatures, boolean>,
  );
};
