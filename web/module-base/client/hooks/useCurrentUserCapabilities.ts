"use client";

import { useQuery } from "@tanstack/react-query";

import userService from "@base/client/services/UserService";

export interface CurrentUserCapabilities {
  /** Có thể xem chi tiết (mặc định true cho mọi user đã đăng nhập) */
  canViewDetail: boolean;
  /** Có thể tạo/chỉnh sửa employee (manager+: hrm.employee.create, hrm.employee.update) */
  canCreateEdit: boolean;
  /** Chỉ admin/system admin: thay đổi roles & permission của user khác */
  canChangePermission: boolean;
  isLoading: boolean;
}

const EMPLOYEE_CREATE = "hrm.employee.create";
const EMPLOYEE_UPDATE = "hrm.employee.update";

export function useCurrentUserCapabilities(): CurrentUserCapabilities {
  const { data, isLoading } = useQuery({
    queryKey: ["meWithRoles"],
    queryFn: () => userService.getMeWithRoles(),
    staleTime: 5 * 60 * 1000,
  });

  const d = data?.data;
  const permissions = d?.permissions ?? [];
  const isGlobalAdmin = d?.isGlobalAdmin ?? false;

  const canCreateEdit =
    permissions.includes(EMPLOYEE_CREATE) || permissions.includes(EMPLOYEE_UPDATE);
  const canChangePermission = isGlobalAdmin;
  const canViewDetail = Boolean(d?.user);

  return {
    canViewDetail,
    canCreateEdit,
    canChangePermission,
    isLoading,
  };
}
