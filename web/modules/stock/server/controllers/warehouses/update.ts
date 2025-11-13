import { NextRequest, NextResponse } from "next/server";

import { getEnv } from "@base/server";
import type StockModel from "../../../server/models/Stock";
import {
  parseAddress,
  parseNullableNumber,
  parseRequiredString,
  parseString,
  serializeWarehouse,
} from "./utils";

export async function PUT(request: NextRequest) {
  try {
    const env = getEnv();
    const stockModel = env.getModel("stock") as StockModel | undefined;

    if (!stockModel) {
      return NextResponse.json(
        { success: false, message: "Stock model not available" },
        { status: 500 }
      );
    }

    const payload = await request.json();
    const id = parseRequiredString(payload.id, "Warehouse id");
    const code = parseRequiredString(payload.code, "Code");
    const name = parseRequiredString(payload.name, "Name");
    const typeCode = parseRequiredString(payload.typeCode, "Type");
    const address = parseAddress(payload.address);

    const minStock = parseNullableNumber(payload.minStock, "Min stock");
    const maxStock = parseNullableNumber(payload.maxStock, "Max stock");

    if (minStock !== null && maxStock !== null && maxStock < minStock) {
      throw new Error("Max stock must be greater than or equal to min stock");
    }

    const record = await stockModel.updateWarehouse(id, {
      code,
      name,
      typeCode,
      status: parseString(payload.status),
      companyId: parseString(payload.companyId) ?? null,
      managerId: parseString(payload.managerId) ?? null,
      contactId: parseString(payload.contactId) ?? null,
      address,
      valuationMethod: parseString(payload.valuationMethod),
      minStock,
      maxStock,
      accountInventory: parseString(payload.accountInventory) ?? null,
      accountAdjustment: parseString(payload.accountAdjustment) ?? null,
      notes: parseString(payload.notes) ?? null,
    });

    return NextResponse.json({
      success: true,
      data: serializeWarehouse(record),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update warehouse";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}

