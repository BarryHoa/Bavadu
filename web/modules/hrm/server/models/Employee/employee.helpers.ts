import { sql } from "drizzle-orm";

/** SQL fullName from user table/alias (for list/dropdown). */
export function fullNameSqlFrom(userRef: {
  firstName: unknown;
  lastName: unknown;
}) {
  return sql<string>`(trim(coalesce(${userRef.lastName},'') || ' ' || coalesce(${userRef.firstName},'')))`;
}
