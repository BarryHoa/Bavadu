import { ListParamsRequest } from "../../../../server/models/interfaces/ListInterface";

export type GetProductListReq = ListParamsRequest;

export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  productType: ProductType;
  categoryId?: number;
  brandId?: number;
  unitOfMeasureId: number;
  isActive: boolean;
  isVariantEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: number;
  updatedBy?: number;

  // Relations
  category?: ProductCategory;
  brand?: Brand;
  unitOfMeasure?: UnitOfMeasure;
}

export interface ProductCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
  parentId?: number;
  level: number;
  path?: string;
  isActive: boolean;
  createdAt: Date;

  // Relations
  parent?: ProductCategory;
  children?: ProductCategory[];
}

export interface Brand {
  id: number;
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface UnitOfMeasure {
  id: number;
  code: string;
  name: string;
  symbol: string;
  type: UnitType;
  baseUnitId?: number;
  conversionFactor: number;
  isActive: boolean;
  createdAt: Date;

  // Relations
  baseUnit?: UnitOfMeasure;
}

export enum ProductType {
  STORABLE = "storable",
  CONSUMABLE = "consumable",
  SERVICE = "service",
  RAW_MATERIAL = "raw_material",
  FINISHED_GOOD = "finished_good",
  TRADING_GOOD = "trading_good",
}

export enum UnitType {
  WEIGHT = "weight",
  VOLUME = "volume",
  LENGTH = "length",
  AREA = "area",
  COUNT = "count",
  TIME = "time",
}

export interface CreateProductRequest {
  code: string;
  name: string;
  description?: string;
  productType: ProductType;
  categoryId?: number;
  brandId?: number;
  unitOfMeasureId: number;
  isActive?: boolean;
  isVariantEnabled?: boolean;
}

export interface UpdateProductRequest {
  code?: string;
  name?: string;
  description?: string;
  productType?: ProductType;
  categoryId?: number;
  brandId?: number;
  unitOfMeasureId?: number;
  isActive?: boolean;
  isVariantEnabled?: boolean;
}

export interface CreateProductCategoryRequest {
  code: string;
  name: string;
  description?: string;
  parentId?: number;
  isActive?: boolean;
}

export interface CreateBrandRequest {
  code: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface CreateUnitOfMeasureRequest {
  code: string;
  name: string;
  symbol: string;
  type: UnitType;
  baseUnitId?: number;
  conversionFactor?: number;
  isActive?: boolean;
}
