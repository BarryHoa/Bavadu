"use client";

import {
  DataTable,
  IBaseInputSearch,
  SelectItemOption,
} from "@base/client/components";
import type { DataTableColumnDefinition } from "@base/client/components";
import { DATA_TABLE_COLUMN_KEY_ACTION } from "@base/client/components";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/react";
import ProductService from "@mdl/product/client/services/ProductService";
import UnitOfMeasureService from "@mdl/product/client/services/UnitOfMeasureService";
import { useQuery } from "@tanstack/react-query";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import {
  Control,
  useFieldArray,
  useFormContext,
  UseFormSetValue,
  useWatch,
} from "react-hook-form";
import PriceItemEditModal from "./PriceItemEditModal";

interface ExplicitPricingTabProps {
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  errors?: any;
}

interface ProductVariantOption {
  id: string;
  name: string | { en?: string; vi?: string };
  sku?: string;
  saleUomId?: string;
  baseUomId?: string;
}

interface PriceItemRow {
  id: string;
  variantId: string;
  variantName: string;
  variantSku?: string;
  uomId: string;
  uomName: string;
  minimumQuantity: string;
  unitPrice: string;
  index: number;
  isDuplicate?: boolean;
}

export default function ExplicitPricingTab({
  control,
  setValue,
  errors,
}: ExplicitPricingTabProps) {
  const { setError } = useFormContext();
  const {
    fields: priceItemFields,
    prepend: prependPriceItem,
    remove: removePriceItem,
  } = useFieldArray({
    control,
    name: "priceItems",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Load products with sale feature
  const productsQuery = useQuery({
    queryKey: ["products-with-sale-feature"],
    queryFn: async () => {
      const response = await ProductService.getProductList({
        page: 1,
        pageSize: 1000,
        filters: {
          "master.features.sale": true,
          "master.isActive": true,
          "variant.isActive": true,
        },
      });
      return response.data || [];
    },
  });

  // Load UOMs
  const uomQuery = useQuery({
    queryKey: ["uoms"],
    queryFn: async () => {
      const response = await UnitOfMeasureService.getList();
      return response.data || [];
    },
  });

  // Build variant options from products
  const variantOptions = useMemo<SelectItemOption[]>(() => {
    if (!productsQuery.data) return [];

    const variants: ProductVariantOption[] = [];
    productsQuery.data.forEach((product: any) => {
      if (product.variant) {
        const variantName =
          typeof product.variant.name === "object"
            ? product.variant.name.vi ||
              product.variant.name.en ||
              product.variant.sku ||
              product.variant.id
            : product.variant.name || product.variant.sku || product.variant.id;

        variants.push({
          id: product.variant.id,
          name: variantName,
          sku: product.variant.sku,
          saleUomId: product.variant.saleUomId,
          baseUomId: product.variant.baseUomId,
        });
      }
    });

    return variants.map((variant) => ({
      value: variant.id,
      label: variant.sku
        ? `${variant.name} (${variant.sku})`
        : String(variant.name),
      saleUomId:
        typeof variant.saleUomId === "string" ? variant.saleUomId : undefined,
      baseUomId:
        typeof variant.baseUomId === "string" ? variant.baseUomId : undefined,
    }));
  }, [productsQuery.data]);

  // Build UOM options
  const uomOptions = useMemo<SelectItemOption[]>(() => {
    if (!uomQuery.data) return [];
    return uomQuery.data
      .filter((uom) => uom.isActive)
      .map((uom) => {
        let name = "";
        if (uom.name) {
          if (typeof uom.name === "object" && uom.name !== null) {
            const nameObj = uom.name as { vi?: string; en?: string };
            name = nameObj.vi || nameObj.en || "";
          } else if (typeof uom.name === "string") {
            name = uom.name;
          }
        }
        const label = uom.symbol ? `${name} (${uom.symbol})` : name;
        return {
          value: uom.id,
          label,
        };
      });
  }, [uomQuery.data]);

  // Watch all priceItems
  const watchedPriceItems = useWatch({
    control,
    name: "priceItems",
  });

  // Build table rows with search filter
  const tableRows = useMemo<PriceItemRow[]>(() => {
    if (!watchedPriceItems || !priceItemFields) return [];

    const rows: PriceItemRow[] = priceItemFields.map((field, index) => {
      const item = watchedPriceItems[index];
      if (!item) return null as any;

      const variant = variantOptions.find((v) => v.value === item.variantId);
      const uom = uomOptions.find((u) => u.value === item.uomId);

      const variantName = variant?.label || "";
      const variantSku = variant?.label?.match(/\(([^)]+)\)/)?.[1] || "";
      const uomName = uom?.label || "";

      // Check for duplicate
      const isDuplicate = watchedPriceItems.some(
        (otherItem: any, otherIndex: number) =>
          otherIndex !== index &&
          otherItem.variantId === item.variantId &&
          otherItem.minimumQuantity === item.minimumQuantity
      );

      return {
        id: field.id,
        variantId: item.variantId || "",
        variantName,
        variantSku,
        uomId: item.uomId || "",
        uomName,
        minimumQuantity: item.minimumQuantity || "",
        unitPrice: item.unitPrice || "",
        index,
        isDuplicate,
      };
    });

    // Filter by search term (name or code/SKU)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      return rows.filter((row) => {
        if (!row) return false;
        const nameMatch = row.variantName.toLowerCase().includes(searchLower);
        const skuMatch = row.variantSku?.toLowerCase().includes(searchLower);
        return nameMatch || skuMatch;
      });
    }

    return rows.filter((row) => row !== null);
  }, [
    watchedPriceItems,
    priceItemFields,
    variantOptions,
    uomOptions,
    searchTerm,
  ]);

  // Get available UOMs for a selected variant
  const getAvailableUomsForVariant = useCallback(
    (variantId: string | undefined): SelectItemOption[] => {
      if (!variantId) return [];

      const variant = variantOptions.find((v) => v.value === variantId);
      if (!variant) return [];

      const availableUomIds: string[] = [];
      const saleUomId =
        typeof variant.saleUomId === "string" ? variant.saleUomId : undefined;
      const baseUomId =
        typeof variant.baseUomId === "string" ? variant.baseUomId : undefined;

      if (saleUomId) {
        availableUomIds.push(saleUomId);
      }
      if (baseUomId && baseUomId !== saleUomId) {
        availableUomIds.push(baseUomId);
      }

      return uomOptions.filter((uom) => availableUomIds.includes(uom.value));
    },
    [variantOptions, uomOptions]
  );

  // Get all tiers for a variant
  const getVariantTiers = useCallback(
    (variantId: string, excludeIndex: number) => {
      if (!variantId) return [];
      return watchedPriceItems
        .filter(
          (item: any, idx: number) =>
            idx !== excludeIndex &&
            item.variantId === variantId &&
            item.minimumQuantity
        )
        .map((item: any) => ({
          minQty: Number(item.minimumQuantity) || 0,
          price: Number(item.unitPrice) || 0,
        }))
        .sort((a, b) => a.minQty - b.minQty);
    },
    [watchedPriceItems]
  );

  // Columns definition
  const columns = useMemo<DataTableColumnDefinition<PriceItemRow>[]>(
    () => [
      {
        key: "variantName",
        label: "Product (Variant)",
        minWidth: 200,
        render: (_, row) => (
          <div>
            <div className="font-medium">{row.variantName}</div>
            {row.isDuplicate && (
              <div className="text-xs text-warning-600 mt-0.5">
                Duplicate combination
              </div>
            )}
          </div>
        ),
      },
      {
        key: "uomName",
        label: "UOM",
        minWidth: 120,
        render: (_, row) => <div>{row.uomName || "-"}</div>,
      },
      {
        key: "minimumQuantity",
        label: "Min. Quantity",
        minWidth: 120,
        align: "end",
        render: (_, row) => (
          <div className="text-right">{row.minimumQuantity || "-"}</div>
        ),
      },
      {
        key: "unitPrice",
        label: "Unit Price",
        minWidth: 150,
        align: "end",
        render: (_, row) => (
          <div className="text-right font-medium">
            {row.unitPrice
              ? `${Number(row.unitPrice).toLocaleString()} VND`
              : "-"}
          </div>
        ),
      },
      {
        key: DATA_TABLE_COLUMN_KEY_ACTION,
        label: "Actions",
        align: "end",
        minWidth: 100,
        render: (_, row) => {
          const tiers = getVariantTiers(row.variantId, row.index);
          return (
            <div className="flex items-center justify-end gap-2">
              {tiers.length > 0 && (
                <div className="text-xs text-default-500">
                  {tiers.length} tier{tiers.length > 1 ? "s" : ""}
                </div>
              )}
              <Button
                size="sm"
                variant="light"
                isIconOnly
                onPress={() => setEditingIndex(row.index)}
              >
                <Edit2 size={16} />
              </Button>
              <Button
                size="sm"
                color="danger"
                variant="light"
                isIconOnly
                onPress={() => removePriceItem(row.index)}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          );
        },
      },
    ],
    [getVariantTiers, removePriceItem]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="w-[500px]">
          <IBaseInputSearch
            placeholder="Search by product name or code..."
            value={searchTerm}
            onValueChange={setSearchTerm}
            size="sm"
          />
        </div>
        <Button
          size="sm"
          color="primary"
          variant="solid"
          startContent={<Plus size={16} />}
          onPress={() => {
            prependPriceItem({
              variantId: "",
              uomId: "",
              unitPrice: "",
              minimumQuantity: "",
            });
            setEditingIndex(0);
          }}
        >
          Add Product
        </Button>
      </div>

      {/* DataTable */}
      {priceItemFields.length === 0 ? (
        <div className="text-sm text-default-500 py-8 text-center">
          No explicit pricing items. Click "Add Product" to add one.
        </div>
      ) : (
        <Card>
          <CardBody className="p-0">
            <DataTable<PriceItemRow>
              columns={columns}
              dataSource={tableRows}
              rowKey="id"
              pagination={false}
              loading={productsQuery.isLoading || uomQuery.isLoading}
              emptyContent={
                searchTerm
                  ? "No products found matching your search"
                  : "No pricing items"
              }
            />
          </CardBody>
        </Card>
      )}

      {/* Edit Modal */}
      {editingIndex !== null && (
        <PriceItemEditModal
          isOpen={editingIndex !== null}
          onClose={() => setEditingIndex(null)}
          index={editingIndex}
          control={control}
          setValue={setValue}
          variantOptions={variantOptions}
          uomOptions={uomOptions}
          getAvailableUomsForVariant={getAvailableUomsForVariant}
          watchedPriceItems={watchedPriceItems}
          isLoading={productsQuery.isLoading}
        />
      )}
    </div>
  );
}
