import { LocalizeText } from "./LocalizeText";

export type Role = {
  id: string;
  code: string;
  name: LocalizeText;
  description?: string;
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  // Module-level admin flags loaded from is_admin_modules JSONB
  isAdminModules?: Record<string, boolean>;
};

export type Permission = {
  id: string;
  key: string;
  module: string;
  resource: string;
  action: string;
  name: LocalizeText;
  description?: string;
  isActive: boolean;
};

export interface UserPermission {
  permissions: string[];
  roles: Array<{
    id: string;
    code: string;
    name: unknown;
  }>;
  isGlobalAdmin?: boolean;
  adminModules?: string[];
}
