import type { LocaleDataType } from "@base/server/interfaces/Locale";

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
