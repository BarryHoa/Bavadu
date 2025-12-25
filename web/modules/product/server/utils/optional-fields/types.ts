import type { LocaleDataType } from "@base/shared/interface/Locale";

export interface OptionalFieldDefinition {
  field: string;
  type: "string" | "number" | "boolean" | "date" | "json" | "integer";
  label: LocaleDataType<string>;
  description?: LocaleDataType<string>;
  isRequired: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    maxLength?: number;
  };
}
