import { unlink } from "fs/promises";
import { existsSync } from "fs";

import ExcelJS from "exceljs";

import { getTemplateConfig } from "./templateRegistry";
import {
  setProgress,
  type ImportResult,
  type RowError,
} from "./importProgressStore";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_EXT = [".xlsx"];

export interface ProcessImportOptions {
  tempFilePath: string;
  key: string;
  jobId: string;
}

/**
 * Process import file asynchronously: read xlsx, validate key, iterate rows, update progress, set done.
 * Deletes temp file when finished.
 */
export async function processImport(
  options: ProcessImportOptions,
): Promise<void> {
  const { tempFilePath, key, jobId } = options;

  try {
    const config = getTemplateConfig(key);

    if (!config) {
      setProgress(jobId, {
        status: "error",
        errorMessage: `Template config not found: ${key}`,
      });

      return;
    }

    setProgress(jobId, { status: "processing" });

    if (!existsSync(tempFilePath)) {
      setProgress(jobId, {
        status: "error",
        errorMessage: "Temp file not found",
      });

      return;
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(tempFilePath);
    const sheet = workbook.worksheets[0];

    if (!sheet) {
      setProgress(jobId, {
        status: "done",
        result: {
          totalRows: 0,
          processed: 0,
          successCount: 0,
          errorCount: 0,
          errors: [],
        },
      });
      await unlink(tempFilePath).catch(() => {});

      return;
    }

    const totalRows = Math.max(0, sheet.rowCount - 1); // exclude header

    setProgress(jobId, { total: totalRows });

    const errors: RowError[] = [];
    let processed = 0;
    let successCount = 0;

    const columnKeys = config.columns.map((c) => c.key);
    const headerRow = sheet.getRow(1);
    const headerValues = headerRow.values as (string | number)[];

    for (let i = 2; i <= (sheet.rowCount ?? 1); i++) {
      const row = sheet.getRow(i);
      const values = row.values as (string | number)[];

      if (!values || values.length < 2) {
        processed++;

        continue;
      }

      const rowData: Record<string, unknown> = {};

      for (let c = 0; c < columnKeys.length; c++) {
        const colKey = columnKeys[c];
        const header = headerValues[c + 1];
        const val = values[c + 1];
        rowData[colKey] = val != null ? String(val).trim() : "";
      }

      // Minimal validation: can be extended per-entity
      const hasData = Object.values(rowData).some(
        (v) => v !== "" && v !== undefined,
      );

      if (hasData) {
        successCount++;
      }

      processed++;
      setProgress(jobId, { processed, total: totalRows });
    }

    const result: ImportResult = {
      totalRows,
      processed,
      successCount,
      errorCount: errors.length,
      errors,
    };

    setProgress(jobId, { status: "done", result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    setProgress(jobId, {
      status: "error",
      errorMessage: message,
    });
  } finally {
    if (existsSync(tempFilePath)) {
      await unlink(tempFilePath).catch(() => {});
    }
  }
}

export function validateImportFile(
  file: File,
): { valid: boolean; error?: string } {
  const name = file.name?.toLowerCase() ?? "";
  const ext = ALLOWED_EXT.some((e) => name.endsWith(e));

  if (!ext) {
    return { valid: false, error: "Only .xlsx files are allowed" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size must not exceed ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB`,
    };
  }

  return { valid: true };
}
