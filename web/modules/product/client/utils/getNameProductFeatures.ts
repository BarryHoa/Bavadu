import { ProductMasterFeatures } from "../interface/Product";

export const convertProductMasterFeaturesToArrayKey = (
  features?: Record<ProductMasterFeatures, boolean>,
) => {
  if (!features) return [];

  return Object.keys(features).filter(
    (key) => features[key as ProductMasterFeatures] === true,
  );
};

export const getNameProductFeatures = (features: ProductMasterFeatures[]) => {
  if (!features) return [];

  const text: Record<ProductMasterFeatures, string> = {
    [ProductMasterFeatures.SALE]: "Sale",
    [ProductMasterFeatures.PURCHASE]: "Purchase",
    [ProductMasterFeatures.MANUFACTURE]: "Manufacture",
    [ProductMasterFeatures.SUBCONTRACT]: "Subcontract",
    [ProductMasterFeatures.STOCKABLE]: "Stockable",
    [ProductMasterFeatures.MAINTENANCE]: "Maintenance",
    [ProductMasterFeatures.ASSET]: "Asset",
    [ProductMasterFeatures.ACCOUNTING]: "Accounting",
  };

  return features.map((feature) => text[feature]);
};
