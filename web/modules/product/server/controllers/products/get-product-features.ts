import type { LocaleDataType } from "@base/server/interfaces/Locale";
import { NextResponse } from "next/server";
import type { ProductMasterFeatures } from "../../models/interfaces/ProductMaster";

export async function GET() {
  try {
    // Map ProductMasterFeatures interface keys to client format
    const featureOptions = [
      {
        key: "sale" as keyof ProductMasterFeatures,
        label: { vi: "Bán", en: "Sale" } as LocaleDataType<string>,
      },
      {
        key: "purchase" as keyof ProductMasterFeatures,
        label: { vi: "Mua", en: "Purchase" } as LocaleDataType<string>,
      },
      {
        key: "manufacture" as keyof ProductMasterFeatures,
        label: { vi: "Sản xuất", en: "Manufacture" } as LocaleDataType<string>,
      },
      {
        key: "subcontract" as keyof ProductMasterFeatures,
        label: {
          vi: "Gia công ngoài",
          en: "Subcontract",
        } as LocaleDataType<string>,
      },
      {
        key: "stockable" as keyof ProductMasterFeatures,
        label: { vi: "Lưu kho", en: "Stockable" } as LocaleDataType<string>,
      },
      {
        key: "maintenance" as keyof ProductMasterFeatures,
        label: { vi: "Bảo trì", en: "Maintenance" } as LocaleDataType<string>,
      },
      {
        key: "asset" as keyof ProductMasterFeatures,
        label: { vi: "Tài sản", en: "Asset" } as LocaleDataType<string>,
      },
      {
        key: "accounting" as keyof ProductMasterFeatures,
        label: { vi: "Kế toán", en: "Accounting" } as LocaleDataType<string>,
      },
    ];

    return NextResponse.json({
      success: true,
      data: featureOptions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product features",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
