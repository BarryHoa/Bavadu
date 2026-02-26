/**
 * Maps JSON-RPC method (modelId.subType.methodName) to required permission key.
 * Only HRM module methods are enforced; other modules are not checked here.
 */

const HRM_MODULE = "hrm";

/** modelId (from module.json) -> permission resource name (key segment) */
const HRM_MODEL_TO_RESOURCE: Record<string, string> = {
  employee: "employee",
  department: "department",
  position: "position",
  contract: "contract",
  shift: "shift",
  "leave-type": "leave_type",
  "leave-request": "leave_request",
  timesheet: "timesheet",
  "timesheet-settings": "timesheet",
  "payroll-period": "payroll",
  payroll: "payroll",
  "job-requisition": "job_requisition",
  candidate: "candidate",
  course: "course",
  certificate: "certificate",
  "performance-review": "performance_review",
};

/**
 * Resolve required permission key for an RPC method.
 * Returns null if the method is not in the HRM permission map (no check).
 */
export function getRequiredPermission(
  modelId: string,
  subType: string,
  methodName: string,
): string | null {
  const resource = HRM_MODEL_TO_RESOURCE[modelId];
  if (!resource) return null;

  const action =
    subType === "list" || subType === "dropdown"
      ? "view"
      : subType === "curd"
        ? curdMethodToAction(methodName)
        : null;
  if (!action) return null;

  return `${HRM_MODULE}.${resource}.${action}`;
}

function curdMethodToAction(methodName: string): string | null {
  switch (methodName) {
    case "getById":
      return "view";
    case "create":
      return "create";
    case "update":
      return "update";
    case "delete":
      return "delete";
    case "approve":
      return "approve";
    default:
      return "view";
  }
}
