import { NextRequest, NextResponse } from "next/server";
import getModuleQueryByModel from "@/module-base/server/utils/getModuleQueryByModel";
import {
  parseAddress,
  parseNullableNumber,
  parseRequiredString,
  parseString,
  serializeWarehouse,
} from "./utils";

export async function PUT(request: NextRequest) {
  try {
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

    const response = await getModuleQueryByModel({
      model: "stock.warehouse",
      modelMethod: "updateWarehouse",
      params: {
        id,
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
      },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update warehouse";
    return NextResponse.json({ success: false, message }, { status: 400 });
  }
}
