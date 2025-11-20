import { NextRequest, NextResponse } from "next/server";
import { AuthenticatedRequest, isAuthenticated } from "./auth";

export type Permission = string;
export type Role = string;

export interface AuthorizationOptions {
  /**
   * Required permissions for this route
   */
  permissions?: Permission[];
  /**
   * Required roles for this route
   */
  roles?: Role[];
  /**
   * If true, user must have ALL specified permissions/roles.
   * If false, user needs ANY of the specified permissions/roles.
   * @default true
   */
  requireAll?: boolean;
  /**
   * Custom error message when authorization fails
   */
  errorMessage?: string;
}

/**
 * Get user roles and permissions from request
 * This is a placeholder - implement based on your actual user/role schema
 */
async function getUserPermissions(
  request: AuthenticatedRequest
): Promise<Permission[]> {
  // TODO: Implement based on your role/permission system
  // For now, return empty array - you'll need to:
  // 1. Add role/permission tables to schema
  // 2. Query user roles and permissions from database
  // 3. Return the permissions
  
  if (!request.user) {
    return [];
  }

  // Placeholder implementation
  // Replace this with actual database query
  return [];
}

async function getUserRoles(
  request: AuthenticatedRequest
): Promise<Role[]> {
  // TODO: Implement based on your role/permission system
  // For now, return empty array - you'll need to:
  // 1. Add role/permission tables to schema
  // 2. Query user roles from database
  // 3. Return the roles
  
  if (!request.user) {
    return [];
  }

  // Placeholder implementation
  // Replace this with actual database query
  return [];
}

/**
 * Check if user has required permissions
 */
function hasPermissions(
  userPermissions: Permission[],
  requiredPermissions: Permission[],
  requireAll: boolean
): boolean {
  if (requiredPermissions.length === 0) {
    return true;
  }

  if (requireAll) {
    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  } else {
    return requiredPermissions.some((perm) => userPermissions.includes(perm));
  }
}

/**
 * Check if user has required roles
 */
function hasRoles(
  userRoles: Role[],
  requiredRoles: Role[],
  requireAll: boolean
): boolean {
  if (requiredRoles.length === 0) {
    return true;
  }

  if (requireAll) {
    return requiredRoles.every((role) => userRoles.includes(role));
  } else {
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}

/**
 * Authorization middleware
 * Checks if authenticated user has required permissions/roles
 */
export async function withAuthorization(
  request: NextRequest,
  options: AuthorizationOptions = {}
): Promise<
  | { authorized: true; request: AuthenticatedRequest }
  | { authorized: false; response: NextResponse }
> {
  const {
    permissions = [],
    roles = [],
    requireAll = true,
    errorMessage = "Insufficient permissions",
  } = options;

  // Must be authenticated first
  if (!isAuthenticated(request)) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  const authRequest = request as AuthenticatedRequest;

  // If no permissions or roles required, allow access
  if (permissions.length === 0 && roles.length === 0) {
    return {
      authorized: true,
      request: authRequest,
    };
  }

  try {
    const userPermissions = await getUserPermissions(authRequest);
    const userRoles = await getUserRoles(authRequest);

    // Check permissions
    const hasRequiredPermissions =
      permissions.length === 0 ||
      hasPermissions(userPermissions, permissions, requireAll);

    // Check roles
    const hasRequiredRoles =
      roles.length === 0 || hasRoles(userRoles, roles, requireAll);

    // If requireAll, both must pass. Otherwise, either can pass.
    const authorized = requireAll
      ? hasRequiredPermissions && hasRequiredRoles
      : hasRequiredPermissions || hasRequiredRoles;

    if (!authorized) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: errorMessage },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      request: authRequest,
    };
  } catch (error) {
    console.error("Authorization error:", error);
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: "Authorization check failed" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Combined authentication and authorization middleware
 */
export async function withAuthAndAuthz(
  request: NextRequest,
  authOptions?: { required?: boolean },
  authzOptions?: AuthorizationOptions
): Promise<
  | { authenticated: true; authorized: true; request: AuthenticatedRequest }
  | { authenticated: false; response: NextResponse }
  | { authenticated: true; authorized: false; response: NextResponse }
> {
  // First check authentication
  const { withAuth } = await import("./auth");
  const authResult = await withAuth(request, authOptions);

  if (!authResult.authenticated) {
    return {
      authenticated: false,
      response: authResult.response,
    };
  }

  // Then check authorization
  const authzResult = await withAuthorization(authResult.request, authzOptions);

  if (!authzResult.authorized) {
    return {
      authenticated: true,
      authorized: false,
      response: authzResult.response,
    };
  }

  return {
    authenticated: true,
    authorized: true,
    request: authzResult.request,
  };
}

