# Product Models

This directory contains the server-side models for the Product module.

## Models Overview

### Legacy Models
- **ProductsModel** - Legacy product model using serial IDs (backward compatibility)

### New Product Models (UUID-based)

#### 1. ProductMasterModel
- **Purpose**: Manages master product templates (Layer 1)
- **Schema**: `product_masters` table
- **Key Features**:
  - CRUD operations with pagination, filtering, search, and sorting
  - Support for multiple product types (goods, service, finished_good, raw_material, consumable, asset, tool)
  - Business features/module gates configuration
  - Multi-locale support for name and description
  - Timestamp tracking with Unix timestamps (ms)

#### 2. ProductVariantModel
- **Purpose**: Manages product variants (Layer 2)
- **Schema**: `product_variants` table
- **Key Features**:
  - CRUD operations with filtering by product master
  - SKU and barcode management
  - Manufacturer information
  - Base UOM assignment
  - Multi-locale support

#### 3. ProductCategoryModel
- **Purpose**: Manages hierarchical product categories
- **Schema**: `product_categories_v2` table
- **Key Features**:
  - CRUD operations with tree structure support
  - Automatic level calculation
  - Parent-child relationships
  - Get category tree method
  - Prevents deletion of categories with children

#### 4. ProductUomModel
- **Purpose**: Manages units of measure and conversions
- **Schema**: `units_of_measure_v2` and `uom_conversions` tables
- **Key Features**:
  - UOM CRUD operations
  - Primary UOM flag
  - Conversion ratios management
  - Multi-locale support

#### 5. ProductPackingModel
- **Purpose**: Manages product packing types
- **Schema**: `product_packings` table
- **Key Features**:
  - CRUD operations
  - Multi-locale support
  - Packing description support

#### 6. ProductAttributeModel
- **Purpose**: Manages product attributes (flexible key-value pairs)
- **Schema**: `product_attributes` table
- **Key Features**:
  - CRUD operations
  - Support for both master and variant entities
  - Batch attribute creation
  - Bulk delete by entity
  - Attribute code and value management

## Common Features

All models inherit from `ModalController` and include:

1. **Pagination**: Standard pagination with total count
2. **Filtering**: Dynamic field-based filtering
3. **Search**: Full-text search across relevant fields
4. **Sorting**: Multi-field sorting support
5. **Error Handling**: Try-catch with console error logging
6. **Timestamps**: Unix timestamp (ms) for createdAt/updatedAt
7. **User Tracking**: createdBy/updatedBy fields

## Database Schema Details

### IDs
- All new models use **UUID** as primary keys (drizzle `uuid().defaultRandom()`)
- Legacy ProductsModel uses **serial integers**

### Timestamps
- Stored as **BigInt** (Unix timestamp in milliseconds)
- Automatically set on create/update operations

### Locale Data
- Stored as **JSONB** for flexibility
- Supports dynamic locale keys

### Relationships
- ProductMaster ↔ ProductCategory (many-to-one)
- ProductVariant ↔ ProductMaster (many-to-one)
- ProductVariant ↔ UnitOfMeasure (many-to-one)
- ProductAttribute ↔ ProductMaster/ProductVariant (many-to-many via junction table)

## Usage Example

```typescript
import { ProductMasterModel } from "@/modules/product/server/models";

// Get products with filtering
const result = await ProductMasterModel.getProductMasters({
  filters: { type: "goods" },
  search: "laptop",
  offset: 0,
  limit: 20,
  sorts: [{ field: "createdAt", direction: "desc" }]
});

// Create a new product master
const newProduct = await ProductMasterModel.createProductMaster({
  code: "PROD-001",
  name: { vi: "Laptop Dell", en: "Dell Laptop" },
  type: "goods",
  isActive: true
});
```

## Migration Notes

- Old schema tables use serial IDs: `products`, `product_categories`, `units_of_measure`
- New schema tables use UUID: `product_masters`, `product_variants`, `product_categories_v2`, `units_of_measure_v2`, `product_packings`, `product_attributes`
- Both schemas coexist for backward compatibility during migration

