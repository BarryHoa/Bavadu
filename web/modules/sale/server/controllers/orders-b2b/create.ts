import getModuleQueryByModel from "@base/server/utils/getModuleQueryByModel";
import { JSONResponse } from "@base/server/utils/JSONResponse";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const { companyName, lines } = payload;
    if (!companyName || !Array.isArray(lines) || lines.length === 0) {
      return JSONResponse({
        message: "companyName and at least one line are required",
        status: 400,
      });
    }

    const response = await getModuleQueryByModel({
      model: "sale.orderB2B",
      modelMethod: "create",
      params: {
        code: payload.code,
        companyName: String(companyName),
        taxId: payload.taxId,
        contactPerson: payload.contactPerson,
        contactPhone: payload.contactPhone,
        contactEmail: payload.contactEmail,
        companyAddress: payload.companyAddress,
        paymentTermsId: payload.paymentTermsId,
        creditLimit: payload.creditLimit,
        invoiceRequired: payload.invoiceRequired,
        shippingMethodId: payload.shippingMethodId,
        shippingTermsId: payload.shippingTermsId,
        warehouseId: payload.warehouseId ?? undefined,
        expectedDate: payload.expectedDate ?? undefined,
        currency: payload.currency ?? undefined,
        notes: payload.notes ?? undefined,
        totalDiscount: payload.totalDiscount,
        totalTax: payload.totalTax,
        shippingFee: payload.shippingFee,
        userId: payload.userId ?? undefined,
        lines: lines.map((line: any) => ({
          productId: String(line.productId),
          quantity: Number(line.quantity ?? 0),
          unitPrice: Number(line.unitPrice ?? 0),
          description: line.description ? String(line.description) : undefined,
          lineDiscount: Number(line.lineDiscount ?? 0),
          taxRate: Number(line.taxRate ?? 0),
        })),
      },
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create B2B sales order";
    return JSONResponse({ message, status: 400 });
  }
}

