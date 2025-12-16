import { ProductMasterType } from "../interface/Product";

export const getNameProductType = (type?: ProductMasterType) => {
  if (!type) return "";
  const text = {
    [ProductMasterType.GOODS]: "Goods",
    [ProductMasterType.SERVICE]: "Service",
    [ProductMasterType.FINISHED_GOOD]: "Finished Good",
    [ProductMasterType.RAW_MATERIAL]: "Raw Material",
    [ProductMasterType.CONSUMABLE]: "Consumable",
    [ProductMasterType.ASSET]: "Asset",
    [ProductMasterType.TOOL]: "Tool",
  };

  return text[type];
};
