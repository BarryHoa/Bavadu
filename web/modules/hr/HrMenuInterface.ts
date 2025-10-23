import { MenuWorkspaceElement } from "@/module-base/interface/WorkspaceMenuInterface";

export type HrMenuKey =
  | "hr-main"
  | "hr-dashboard"
  | "hr-employee-management"
  | "hr-employees-all"
  | "hr-employees-add"
  | "hr-employees-profiles"
  | "hr-employees-org-chart"
  | "hr-attendance"
  | "hr-attendance-daily"
  | "hr-attendance-time-tracking"
  | "hr-attendance-leave"
  | "hr-attendance-reports"
  | "hr-payroll"
  | "hr-payroll-monthly"
  | "hr-payroll-salary-structure"
  | "hr-payroll-benefits"
  | "hr-payroll-tax"
  | "hr-performance"
  | "hr-performance-reviews"
  | "hr-performance-goals"
  | "hr-performance-training"
  | "hr-performance-career"
  | "hr-admin"
  | "hr-admin-policies"
  | "hr-admin-roles"
  | "hr-admin-settings"
  | "hr-admin-security";

export interface HrMenuItem extends MenuWorkspaceElement<HrMenuKey> {}
