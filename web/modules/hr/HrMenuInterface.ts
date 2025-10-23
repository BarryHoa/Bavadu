import { MenuWorkspaceElement } from "@/module-base/interface/WorkspaceMenuInterface";

export type HrMenuKey =
  | "hr-main"
  | "hr-main-dashboard"
  | "hr-employees"
  | "hr-roles"
  | "hr-org-chart"
  | "hr-payroll"
  | "hr-attendance"
  | "hr-policies"
  | "hr-security";

export interface HrMenuItem extends MenuWorkspaceElement<HrMenuKey> {}
