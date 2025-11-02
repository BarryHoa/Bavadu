import { LocaleDataType } from "@base/server/interfaces/Locale";
import { User } from "@base/server/interfaces/User";

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

