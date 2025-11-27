import { BaseModel } from "@base/server/models/BaseModel";
import { eq } from "drizzle-orm";
import {
  table_product_attribute,
  table_product_category,
  table_product_packing,
  table_product_variant,
  table_unit_of_measure,
  table_uom_conversion,
} from "../../schemas";
import {
  table_product_master,
  TblProductMaster,
} from "../../schemas/product-master";

import { MasterProduct } from "../interfaces/ProductMaster";
import {
  ProductAttributeInput,
  ProductCreateInput,
  ProductDetail,
  ProductPackingInput,
  ProductUpdateInput,
} from "./ProductModelInterface";

class ProductModel extends BaseModel<typeof table_product_variant> {
  constructor() {
    super(table_product_variant);
  }

  private mapToMasterProduct = (dbProduct: TblProductMaster): MasterProduct => {
    return {
      id: dbProduct.id,
      code: dbProduct.code,
      name: dbProduct.name as MasterProduct["name"],
      type: dbProduct.type as MasterProduct["type"],
      features: dbProduct.features as MasterProduct["features"],
      isActive: dbProduct.isActive,
      brand: dbProduct.brand ?? undefined,
      createdAt: dbProduct.createdAt?.getTime(),
      updatedAt: dbProduct.updatedAt?.getTime(),
      // Note: createdBy and updatedBy are stored as user IDs (strings) in DB
      // They would need to be resolved to User objects if needed
      // For now, we omit them as they're optional
    };
  };

  private normalizeLocale = (value: unknown) => {
    if (!value) {
      return null;
    }

    if (typeof value === "string") {
      return { en: value };
    }

    return value;
  };

  private getProductDetailInternal = async (
    id: string,
    db = this.db
  ): Promise<ProductDetail | null> => {
    const rows = await db
      .select({
        variant: this.table,
        master: table_product_master,
        category: table_product_category,
        baseUom: table_unit_of_measure,
      })
      .from(this.table)
      .innerJoin(
        table_product_master,
        eq(this.table.productMasterId, table_product_master.id)
      )
      .leftJoin(
        table_product_category,
        eq(table_product_master.categoryId, table_product_category.id)
      )
      .leftJoin(
        table_unit_of_measure,
        eq(this.table.baseUomId, table_unit_of_measure.id)
      )
      .where(eq(this.table.id, id))
      .limit(1);

    const record = rows[0];

    if (!record) {
      return null;
    }

    const packings = await db
      .select()
      .from(table_product_packing)
      .where(eq(table_product_packing.productVariantId, id));

    const attributes = await db
      .select()
      .from(table_product_attribute)
      .where(eq(table_product_attribute.productVariantId, id));

    return {
      variant: {
        id: record.variant.id,
        productMasterId: record.variant.productMasterId,
        name: record.variant.name as any,
        description: record.variant.description ?? undefined,
        images: record.variant.images as any,
        sku: record.variant.sku ?? undefined,
        barcode: record.variant.barcode ?? undefined,
        manufacturer: record.variant.manufacturer as any,
        baseUom: record.baseUom
          ? {
              id: record.baseUom.id,
              name: record.baseUom.name as any,
              symbol: record.baseUom.symbol ?? undefined,
              isActive: record.baseUom.isActive ?? undefined,
            }
          : undefined,
        isActive: record.variant.isActive,
        attributes: [],
        createdAt: record.variant.createdAt?.getTime(),
        updatedAt: record.variant.updatedAt?.getTime(),
      },
      master: {
        ...this.mapToMasterProduct(record.master),
        category: record.category
          ? {
              id: record.category.id,
              code: record.category.code ?? "",
              name: record.category.name as any,
              description: record.category.description as any,
              parentId: record.category.parentId ?? undefined,
              level: record.category.level ?? 1,
              isActive:
                record.category.isActive === undefined
                  ? true
                  : Boolean(record.category.isActive),
              createdAt: record.category.createdAt?.getTime(),
              updatedAt: record.category.updatedAt?.getTime(),
            }
          : undefined,
      },
      packings: packings.map((packing) => ({
        id: packing.id,
        name: packing.name as any,
        description: packing.description || undefined,
        isActive: packing.isActive,
        createdAt: packing.createdAt?.getTime(),
        updatedAt: packing.updatedAt?.getTime(),
      })),
      attributes: attributes.map((attr) => ({
        id: attr.id,
        code: attr.code,
        name: attr.name as any,
        value: attr.value ?? "",
      })),
    };
  };

  getProductDetail = async (id: string): Promise<ProductDetail | null> => {
    return this.getProductDetailInternal(id, this.db);
  };

  private ensurePackingValues = (
    packings: ProductPackingInput[] | undefined
  ): ProductPackingInput[] => {
    return (packings ?? []).filter((packing) => Boolean(packing?.name));
  };

  private ensureAttributeValues = (
    attributes: ProductAttributeInput[] | undefined
  ): ProductAttributeInput[] => {
    return (attributes ?? []).filter((attribute) =>
      Boolean(attribute?.code && attribute?.name)
    );
  };

  createProduct = async (payload: ProductCreateInput) => {
    const now = new Date();

    const result = await this.db.transaction(async (tx) => {
      const [master] = await tx
        .insert(table_product_master)
        .values({
          code: payload.master.code.trim(),
          name: this.normalizeLocale(payload.master.name) ?? {
            en: payload.master.code.trim(),
          },
          description: payload.master.description?.trim() || null,
          type: payload.master.type,
          features: payload.master.features ?? null,
          isActive: payload.master.isActive ?? true,
          brand: payload.master.brand?.trim() || null,
          categoryId: payload.master.categoryId || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: table_product_master.id });

      if (!master) {
        throw new Error("Failed to create product master");
      }

      const [variant] = await tx
        .insert(this.table)
        .values({
          productMasterId: master.id,
          name: this.normalizeLocale(payload.variant.name) ?? {
            en: payload.master.code.trim(),
          },
          description: payload.variant.description?.trim() || null,
          images: payload.variant.images ?? null,
          sku: payload.variant.sku?.trim() || null,
          barcode: payload.variant.barcode?.trim() || null,
          manufacturer: payload.variant.manufacturer
            ? {
                name: payload.variant.manufacturer.name?.trim() || undefined,
                code: payload.variant.manufacturer.code?.trim() || undefined,
              }
            : null,
          baseUomId: payload.variant.baseUomId || null,
          saleUomId: payload.variant.saleUomId || null,
          purchaseUomId: payload.variant.purchaseUomId || null,
          manufacturingUomId: payload.variant.manufacturingUomId || null,
          isActive: payload.variant.isActive ?? true,
          createdAt: now,
          updatedAt: now,
        })
        .returning({ id: this.table.id });

      if (!variant) {
        throw new Error("Failed to create product variant");
      }

      const normalizedPackings = this.ensurePackingValues(payload.packings);

      if (normalizedPackings.length) {
        await tx.insert(table_product_packing).values(
          normalizedPackings.map((packing) => ({
            productVariantId: variant.id,
            name: this.normalizeLocale(packing.name) ?? {
              en: packing.id ?? "",
            },
            description: packing.description?.trim() || null,
            isActive: packing.isActive ?? true,
            createdAt: now,
            updatedAt: now,
          }))
        );
      }

      const normalizedAttributes = this.ensureAttributeValues(
        payload.attributes
      );

      if (normalizedAttributes.length) {
        await tx.insert(table_product_attribute).values(
          normalizedAttributes.map((attribute) => ({
            productVariantId: variant.id,
            code: attribute.code.trim(),
            name: this.normalizeLocale(attribute.name) ?? {
              en: attribute.code.trim(),
            },
            value: attribute.value,
            createdAt: now,
            updatedAt: now,
          }))
        );
      }

      // Handle uomConversions - create units_of_measure records
      const normalizedUomConversions = payload.uomConversions ?? [];
      if (normalizedUomConversions.length > 0 && variant.baseUomId) {
        // Insert UOM records first
        const uomInserts = await tx
          .insert(table_unit_of_measure)
          .values(
            normalizedUomConversions.map((conversion) => ({
              name: this.normalizeLocale(conversion.uomName) ?? {
                en: conversion.uomName,
              },
              symbol: null,
              isActive: true,
              createdAt: now,
              updatedAt: now,
            }))
          )
          .returning({ id: table_unit_of_measure.id });

        // Then insert conversion records linking to baseUomId
        if (uomInserts.length > 0) {
          await tx.insert(table_uom_conversion).values(
            normalizedUomConversions.map((conversion, index) => ({
              uomId: uomInserts[index]?.id || conversion.uomId,
              conversionRatio: conversion.conversionRatio.toString(),
              createdAt: now,
              updatedAt: now,
            }))
          );
        }
      }

      return { id: variant.id };
    });

    return this.getProductDetail(result.id);
  };

  updateProduct = async (payload: ProductUpdateInput) => {
    const now = new Date();

    const result = await this.db.transaction(async (tx) => {
      const existingVariant = await tx
        .select({ id: this.table.id, masterId: this.table.productMasterId })
        .from(this.table)
        .where(eq(this.table.id, payload.id))
        .limit(1);

      const variantRow = existingVariant[0];

      if (!variantRow) {
        throw new Error("Product variant not found");
      }

      await tx
        .update(table_product_master)
        .set({
          code: payload.master.code.trim(),
          name: this.normalizeLocale(payload.master.name) ?? {
            en: payload.master.code.trim(),
          },
          description: payload.master.description?.trim() || null,
          type: payload.master.type,
          features: payload.master.features ?? null,
          isActive: payload.master.isActive ?? true,
          brand: payload.master.brand?.trim() || null,
          categoryId: payload.master.categoryId || null,
          updatedAt: now,
        })
        .where(eq(table_product_master.id, variantRow.masterId));

      await tx
        .update(this.table)
        .set({
          name: this.normalizeLocale(payload.variant.name) ?? {
            en: payload.master.code.trim(),
          },
          description: payload.variant.description?.trim() || null,
          images: payload.variant.images ?? null,
          sku: payload.variant.sku?.trim() || null,
          barcode: payload.variant.barcode?.trim() || null,
          manufacturer: payload.variant.manufacturer
            ? {
                name: payload.variant.manufacturer.name?.trim() || undefined,
                code: payload.variant.manufacturer.code?.trim() || undefined,
              }
            : null,
          baseUomId: payload.variant.baseUomId || null,
          saleUomId: payload.variant.saleUomId || null,
          purchaseUomId: payload.variant.purchaseUomId || null,
          manufacturingUomId: payload.variant.manufacturingUomId || null,
          isActive: payload.variant.isActive ?? true,
          updatedAt: now,
        })
        .where(eq(this.table.id, payload.id));

      await tx
        .delete(table_product_packing)
        .where(eq(table_product_packing.productVariantId, payload.id));

      const normalizedPackings = this.ensurePackingValues(payload.packings);

      if (normalizedPackings.length) {
        await tx.insert(table_product_packing).values(
          normalizedPackings.map((packing) => ({
            productVariantId: payload.id,
            name: this.normalizeLocale(packing.name) ?? {
              en: packing.id ?? "",
            },
            description: packing.description?.trim() || null,
            isActive: packing.isActive ?? true,
            createdAt: now,
            updatedAt: now,
          }))
        );
      }

      await tx
        .delete(table_product_attribute)
        .where(eq(table_product_attribute.productVariantId, payload.id));

      const normalizedAttributes = this.ensureAttributeValues(
        payload.attributes
      );

      if (normalizedAttributes.length) {
        await tx.insert(table_product_attribute).values(
          normalizedAttributes.map((attribute) => ({
            productVariantId: payload.id,
            code: attribute.code.trim(),
            name: this.normalizeLocale(attribute.name) ?? {
              en: attribute.code.trim(),
            },
            value: attribute.value,
            createdAt: now,
            updatedAt: now,
          }))
        );
      }

      return { id: payload.id };
    });

    return this.getProductDetail(result.id);
  };
}
export default ProductModel;

// export default new ProductModel();
