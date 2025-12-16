import { LocaleDataType } from "@base/server/interfaces/Locale";

export interface ProductAttribute {
  /**
   * code là một string viết liền không dấu, hoặc cách nhau dấu _
   * Ví dụ: "color", "material_type"
   */
  code: string;
  name: LocaleDataType<string>;
  value: string;
}
