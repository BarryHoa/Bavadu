import { NextResponse } from "next/server";
import { ProductMasterEnum } from "../../models/interfaces/ProductMaster";
import type { LocaleDataType } from "@base/server/interfaces/Locale";

export async function GET() {
  try {
    const masterTypes = [
      {
        value: ProductMasterEnum.GOODS,
        label: { vi: "Hàng hóa", en: "Goods" } as LocaleDataType<string>,
      },
      {
        value: ProductMasterEnum.SERVICE,
        label: { vi: "Dịch vụ", en: "Service" } as LocaleDataType<string>,
      },
      {
        value: ProductMasterEnum.FINISHED_GOOD,
        label: {
          vi: "Thành phẩm",
          en: "Finished good",
        } as LocaleDataType<string>,
      },
      {
        value: ProductMasterEnum.RAW_MATERIAL,
        label: {
          vi: "Nguyên liệu",
          en: "Raw material",
        } as LocaleDataType<string>,
      },
      {
        value: ProductMasterEnum.CONSUMABLE,
        label: { vi: "Vật tư tiêu hao", en: "Consumable" } as LocaleDataType<string>,
      },
      {
        value: ProductMasterEnum.ASSET,
        label: { vi: "Tài sản", en: "Asset" } as LocaleDataType<string>,
      },
      {
        value: ProductMasterEnum.TOOL,
        label: { vi: "Công cụ", en: "Tool" } as LocaleDataType<string>,
      },
    ];

    return NextResponse.json({
      success: true,
      data: masterTypes,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product types",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

