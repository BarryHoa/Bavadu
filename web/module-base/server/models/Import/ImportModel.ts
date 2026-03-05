import type { NextRequest } from "next/server";

import ExcelJS from "exceljs";

import { JSON_RPC_ERROR_CODES, JsonRpcError } from "@base/server/rpc";
import { getTemplateConfig } from "@base/server/import/templateRegistry";
import UserPermissionModel from "@base/server/models/UserPermission/UserPermissionModel";

/**
 * Import model: RPC getTemplate only.
 * Permission is per-template (config.requiredPermission), e.g. hrm.timesheet.import.
 */
class ImportModel {
  getPermissionRequiredForMethod(_methodName: string): {
    required: boolean;
    permissions?: string[];
  } | null {
    return null;
  }

  /**
   * RPC: base-import.curd.getTemplate
   * Returns template file as base64 and fileName.
   * Requires auth and config.requiredPermission for the given key.
   */
  async getTemplate(
    params: { key: string },
    request?: NextRequest,
  ): Promise<{ fileName: string; base64: string }> {
    const key =
      typeof params === "object" && params?.key != null
        ? String(params.key).trim()
        : "";

    if (!key) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.VALIDATION_ERROR,
        "Template key is required",
      );
    }

    const config = getTemplateConfig(key);

    if (!config) {
      throw new JsonRpcError(
        JSON_RPC_ERROR_CODES.RESOURCE_NOT_FOUND,
        `Template not found: ${key}`,
      );
    }

    const userId = request?.headers.get("x-user-id");

    if (!userId) {
      throw new JsonRpcError(JSON_RPC_ERROR_CODES.AUTHENTICATION_ERROR);
    }

    if (config.requiredPermission) {
      const permissionModel = new UserPermissionModel();
      const hasPermission = await permissionModel.hasAllPermissions(userId, [
        config.requiredPermission,
      ]);

      if (!hasPermission) {
        throw new JsonRpcError(JSON_RPC_ERROR_CODES.PERMISSION_DENIED);
      }
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Data", { views: [{ state: "frozen", ySplit: 1 }] });

    const headerRow = sheet.addRow(config.columns.map((c) => c.header));
    headerRow.font = { bold: true };

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const fileName = `${key}-template.xlsx`;

    return { fileName, base64 };
  }
}

export default ImportModel;
