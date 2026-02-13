import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";

import { base_tb_permissions } from "../../schemas";

export interface PermissionRow {
  id: string;
  key: string;
  module: string;
  resource: string;
  action: string;
  name?: unknown;
  description?: unknown;
  isActive?: boolean;
  createdAt?: Date | null;
}

export default class PermissionModel extends BaseModel<
  typeof base_tb_permissions
> {
  constructor() {
    super(base_tb_permissions);
  }

  /**
   * RPC entry point: base-permission.curd.getPermissions
   */
  getPermissions = async (): Promise<PermissionRow[]> => {
    const db = await this.db;
    const results = await db
      .select()
      .from(this.table)
      .where(eq(this.table.isActive, true))
      .orderBy(this.table.module, this.table.resource, this.table.action);

    return results.map((row) => this.mapToPermissionRow(row));
  };

  private mapToPermissionRow(
    row: typeof base_tb_permissions.$inferSelect,
  ): PermissionRow {
    return {
      id: row.id,
      key: row.key,
      module: row.module,
      resource: row.resource,
      action: row.action,
      name: row.name,
      description: row.description ?? undefined,
      isActive: row.isActive ?? undefined,
      createdAt: row.createdAt ?? undefined,
    };
  }
}
