import { LocaleDataType } from "./Locale";
import { User } from "./User";

export type DynamicEntityData =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "select"
  | "multi-select";

export type DynamicEntityValidationNumber = {
  min?: number;
  max?: number;
  notZero?: boolean;
  allowNegative?: boolean;
  message?: LocaleDataType<string>;
};
export type DynamicEntityValidationString = {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message?: LocaleDataType<string>;
};

export interface DynamicEntity<V = string> {
  id: string; // uuid v7
  code: string; // code là một string viết liền không dấu, hoặc cách nhau dấu _
  name: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  model: string; // name of the model // 'product, customer, supplier, etc.
  dataType: DynamicEntityData;
  options?: {
    label: LocaleDataType<string>;
    value: V;
  }[];
  defaultValue?: V;
  isRequired?: boolean;
  validation?: (
    | DynamicEntityValidationNumber
    | DynamicEntityValidationString
  )[];

  useIn?:{
    report?: boolean;
    list?: boolean;
    filter?: boolean;
  }
  isActive: boolean;
  order: number;
  createdAt?: number; // unix timestamp (ms)
  updatedAt?: number; // unix timestamp (ms)
  createdBy?: User;
  updatedBy?: User;
}

