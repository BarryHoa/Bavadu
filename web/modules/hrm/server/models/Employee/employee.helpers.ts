import { sql } from "drizzle-orm";

/** HR-only input. Personal data (name, email, phone) lives on user. */
export interface EmployeeInput {
  userId?: string | null;
  employeeCode: string;
  nationalId?: string | null;
  taxId?: string | null;
  positionId: string;
  departmentId: string;
  managerId?: string | null;
  employmentStatus?: string;
  employmentType?: string | null;
  hireDate: string;
  probationEndDate?: string | null;
  baseSalary?: number | null;
  currency?: string | null;
  locationId?: string | null;
  bankAccount?: string | null;
  bankName?: string | null;
  bankBranch?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isActive?: boolean;
}

const STR_KEYS = [
  "userId",
  "employeeCode",
  "nationalId",
  "taxId",
  "positionId",
  "departmentId",
  "managerId",
  "employmentStatus",
  "employmentType",
  "hireDate",
  "probationEndDate",
  "currency",
  "locationId",
  "bankAccount",
  "bankName",
  "bankBranch",
  "emergencyContactName",
  "emergencyContactPhone",
] as const;

const REQUIRED_STR: readonly (keyof EmployeeInput)[] = [
  "employeeCode",
  "positionId",
  "departmentId",
  "hireDate",
];

const DEFAULTS_CREATE: Partial<EmployeeInput> = {
  employmentStatus: "active",
  currency: "VND",
  isActive: true,
};

const empty = (v: unknown) => v == null || v === "";

function num(v: unknown): number | null {
  if (empty(v)) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

/** Normalize raw payload to HR-only. Create: full object + defaults. Update: only present keys. */
export function normalizePayload(
  payload: Record<string, unknown>,
  opts?: { partial?: boolean },
): EmployeeInput | Partial<EmployeeInput> {
  const partial = opts?.partial ?? false;
  const out: Record<string, unknown> = partial ? {} : { ...DEFAULTS_CREATE };

  for (const k of STR_KEYS) {
    if (payload[k] === undefined && partial) continue;
    const val = payload[k];
    if (k === "userId") {
      (out as any)[k] = empty(val) ? null : val;
    } else if (!partial && REQUIRED_STR.includes(k)) {
      (out as any)[k] = String(val ?? "");
    } else {
      (out as any)[k] = empty(val) ? null : String(val);
    }
  }
  if (payload.baseSalary !== undefined || !partial) {
    (out as any).baseSalary = num(payload.baseSalary);
  }
  if (payload.isActive !== undefined || !partial) {
    (out as any).isActive =
      payload.isActive === undefined && !partial ? true : Boolean(payload.isActive);
  }

  return out as EmployeeInput | Partial<EmployeeInput>;
}

/** fullName from user first + last (for API response). */
export function buildFullName(
  firstName: string | null,
  lastName: string | null,
): string {
  const first = (firstName ?? "").trim();
  const last = (lastName ?? "").trim();
  if (!first && !last) return "";
  return last ? `${last} ${first}`.trim() : first;
}

/** SQL fullName from user table/alias (for list/dropdown). */
export function fullNameSqlFrom(userRef: { firstName: unknown; lastName: unknown }) {
  return sql<string>`(trim(coalesce(${userRef.lastName},'') || ' ' || coalesce(${userRef.firstName},'')))`;
}
