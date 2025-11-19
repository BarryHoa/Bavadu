import { ProductMasterEnum } from "../../models/interfaces/ProductMaster";
import { assetOptionalFields } from "./asset";
import { consumableOptionalFields } from "./consumable";
import { finishedGoodOptionalFields } from "./finished-good";
import { goodsOptionalFields } from "./goods";
import { rawMaterialOptionalFields } from "./raw-material";
import { serviceOptionalFields } from "./service";
import type { OptionalFieldDefinition } from "./types";
import { toolOptionalFields } from "./tool";

export type { OptionalFieldDefinition };

export const OPTIONAL_FIELDS_BY_TYPE: Record<
  ProductMasterEnum,
  OptionalFieldDefinition[]
> = {
  [ProductMasterEnum.GOODS]: goodsOptionalFields,
  [ProductMasterEnum.RAW_MATERIAL]: rawMaterialOptionalFields,
  [ProductMasterEnum.FINISHED_GOOD]: finishedGoodOptionalFields,
  [ProductMasterEnum.CONSUMABLE]: consumableOptionalFields,
  [ProductMasterEnum.TOOL]: toolOptionalFields,
  [ProductMasterEnum.ASSET]: assetOptionalFields,
  [ProductMasterEnum.SERVICE]: serviceOptionalFields,
};

export function getOptionalFieldsByProductType(
  type: ProductMasterEnum
): OptionalFieldDefinition[] {
  return OPTIONAL_FIELDS_BY_TYPE[type] || [];
}

