import { LocaleDataType } from "@/module-base/shared/Locale";
import { User } from "@base/shared/User";

export type ProductCategoryId = string; // uuid v7
export interface ProductCategory {
    id: ProductCategoryId;
    code: string;
    name: LocaleDataType<string>;
    description?: LocaleDataType<string>;
    parentId?: ProductCategoryId;
    level: number;
    isActive: boolean;
    createdAt?: number; // unix timestamp (ms)
    updatedAt?: number; // unix timestamp (ms)
    createdBy?: User;
    updatedBy?: User;
  }