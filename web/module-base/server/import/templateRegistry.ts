/**
 * Registry for import template configs (in-code only, no DB).
 * Modules register templates via registerImportTemplate; getTemplateConfig is used by ImportModel.
 */

export interface ImportTemplateConfig {
  /** Display name for the template */
  name: string;
  /** Columns definition for generating the Excel template (header row) */
  columns: { key: string; header: string }[];
  /** Permission required to use this template (e.g. hrm.timesheet.import). Checked on upload and progress. */
  requiredPermission: string;
}

const registry = new Map<string, ImportTemplateConfig>();

export function getTemplateConfig(key: string): ImportTemplateConfig | undefined {
  return registry.get(key);
}

export function registerImportTemplate(
  key: string,
  config: ImportTemplateConfig,
): void {
  registry.set(key, config);
}

// Sample template for testing / demo (uses base.import.import)
registerImportTemplate("sample", {
  name: "Sample Import",
  requiredPermission: "base.import.import",
  columns: [
    { key: "code", header: "Code" },
    { key: "name", header: "Name" },
  ],
});

// HRM Timesheet template — permission: hrm.timesheet.import
registerImportTemplate("hrm.timesheet", {
  name: "Import Timesheets",
  requiredPermission: "hrm.timesheet.import",
  columns: [
    { key: "employeeCode", header: "Mã nhân viên" },
    { key: "workDate", header: "Ngày làm (YYYY-MM-DD)" },
    { key: "shiftCode", header: "Mã ca" },
    { key: "checkInTime", header: "Giờ vào" },
    { key: "checkOutTime", header: "Giờ ra" },
    { key: "status", header: "Trạng thái" },
    { key: "notes", header: "Ghi chú" },
  ],
});
