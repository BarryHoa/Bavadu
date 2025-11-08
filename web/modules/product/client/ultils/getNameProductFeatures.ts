import { ProductMasterFeatures } from "../interface/Product";

export const convertProductMasterFeaturesToArrayKey = (
  features?: Record<ProductMasterFeatures, boolean>
) => {
  if (!features) return [];
  return Object.keys(features).filter(
    (key) => features[key as ProductMasterFeatures] === true
  );
};

export const getNameProductFeatures = (features: ProductMasterFeatures[]) => {
  if (!features) return [];
  console.log(features);
  const text = {
    [ProductMasterFeatures.SALE]: "Sale",
    [ProductMasterFeatures.PURCHASE]: "Purchase",
    [ProductMasterFeatures.MANUFACTURE]: "Manufacture",
    [ProductMasterFeatures.SUBCONTRACT]: "Subcontract",
    [ProductMasterFeatures.STOCKABLE]: "Stockable",
    [ProductMasterFeatures.MAINTENANCE]: "Maintenance",
    [ProductMasterFeatures.ASSET]: "Asset",
  };
  return features.map((feature) => text[feature]);
};
