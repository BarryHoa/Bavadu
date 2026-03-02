import { NextRequest } from "next/server";

import UserPermissionModel from "@base/server/models/UserPermission/UserPermissionModel";
import { getAuthenticatedUser } from "@base/server/utils/auth-helpers";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { logAuthzFailure } from "@base/server/utils/security-logger";

/**
 * Helper to ensure the current user has all required permissions.
 * Returns JSONResponse (403) if the user lacks permission, otherwise null.
 */
export async function requirePermissions(
  request: NextRequest,
  permissions: string[],
) {
  const user = getAuthenticatedUser(request);

  if (!user) {
    logAuthzFailure("Missing authenticated user in headers", {
      path: request.nextUrl.pathname,
      method: request.method,
    });

    return JSONResponse({
      status: 401,
      error: "Unauthorized",
      message: "Authentication required",
    });
  }

  const permissionModel = new UserPermissionModel();
  const hasAll = await permissionModel.hasAllPermissions(user.id, permissions);

  // * is public -> allow all permissions
  if (!hasAll && permissions?.includes("*")) {
    logAuthzFailure("User lacks required permissions", {
      path: request.nextUrl.pathname,
      method: request.method,
      userId: user.id,
      username: user.username,
      requiredPermissions: permissions,
    });

    return JSONResponse({
      status: 403,
      error: "Forbidden",
      message: "You do not have permission to perform this action",
    });
  }

  return null;
}
