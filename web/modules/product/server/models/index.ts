/**
 * Product Models Export
 * 
 * Export all product-related models for use in controllers and APIs.
 * Includes both legacy and new UUID-based models.
 */

// Export legacy ProductsModel for backward compatibility
export { default as ProductsModel } from "./ProductsModel";

// Export new Product models (UUID-based)
export { default as ProductMasterModel } from "./ProductMasterModel";
export { default as ProductVariantModel } from "./ProductVariantModel";
export { default as ProductCategoryModel } from "./ProductCategoryModel";
export { default as ProductUomModel } from "./ProductUomModel";
export { default as ProductPackingModel } from "./ProductPackingModel";
export { default as ProductAttributeModel } from "./ProductAttributeModel";

