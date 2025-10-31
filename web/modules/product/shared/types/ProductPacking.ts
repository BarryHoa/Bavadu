import { LocaleDataType } from "@base/shared/Locale";
import { User } from "@base/shared/User";

export interface ProductPacking {
  id: string; // uuid v7
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  isActive: boolean;
  createdAt?: number; // unix timestamp (ms)
  updatedAt?: number; // unix timestamp (ms)
  createdBy?: User;
  updatedBy?: User;
}