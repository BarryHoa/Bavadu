# Address Utilities

This directory contains utilities for working with addresses in the application.

## Files

### `addressUtils.ts`

Utility functions for address manipulation:

- **`buildAddressString(address: Partial<Address>): string`**
  - Builds a formatted address string from an Address object
  - Format: "Street, [Administrative Units sorted by level], PostalCode, Country"
  - Handles both string and LocalizeText name formats

- **`formatAddressDisplay(address: Partial<Address>): string`**
  - Formats an address for display purposes
  - Currently an alias for `buildAddressString`

- **`getUnitByLevel(address, level): AdministrativeUnit | undefined`**
  - Get administrative unit by level number

- **`getUnitByType(address, type): AdministrativeUnit | undefined`**
  - Get administrative unit by type

- **`getUnitsByType(address, type): AdministrativeUnit[]`**
  - Get all units of a specific type

- **`getHighestLevelUnit(address): AdministrativeUnit | undefined`**
  - Get the highest level administrative unit

- **`getLowestLevelUnit(address): AdministrativeUnit | undefined`**
  - Get the lowest level administrative unit (level > 0)

- **`hasUnitType(address, type): boolean`**
  - Check if address has a specific administrative unit type

- **`createAddressFromStructured(data): Partial<Address>`**
  - Create Address object from structured data (backward compatibility helper)

- **`isOldVietnamStructure(address): boolean`**
  - Check if Vietnam address uses old structure (3 levels with district) or new structure (2 levels without district)
  - Returns `true` if old structure (has district), `false` if new structure (no district)
  - **Cách dùng đơn giản nhất**: `if (isOldVietnamStructure(address)) { /* cấu trúc cũ */ }`

- **`getVietnamStructureType(address): "old" | "new" | undefined`**
  - Get the structure type for Vietnam address
  - Returns `"old"` for 3 levels, `"new"` for 2 levels, `undefined` if not Vietnam
  - **Cách dùng**: `const type = getVietnamStructureType(address);`

- **`validateVietnamAddress(address): boolean`**
  - Validate Vietnam address structure (must have province and level 3 unit, district is optional)
  - Returns `true` if valid, `false` if invalid

## Address Structure

The Address type uses a flexible array-based structure supporting any number of administrative levels:

```typescript
type Address = {
  street: string;  // Địa chỉ đường
  postalCode: string;  // Mã bưu điện
  country: { id: string; name: LocalizeText };  // Quốc gia
  administrativeUnits: AdministrativeUnit[];  // Array of administrative units
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
};

type AdministrativeUnit = {
  id: string;
  name: LocalizeText;
  type: AdministrativeUnitType;  // 'province' | 'state' | 'district' | 'city' | 'ward' | etc.
  level: number;  // 0 = country, 1 = province/state, 2 = district/city, 3 = ward, etc.
};
```

**Lưu ý**: 
- Cấu trúc này linh hoạt, hỗ trợ cả địa chỉ Việt Nam và quốc tế
- Ở Việt Nam hỗ trợ cả 2 cấu trúc:

  **CẤU TRÚC CŨ (3 levels - truyền thống):**
  - Level 1: Tỉnh/Thành phố (Province)
  - Level 2: Quận/Huyện (District) - **BẮT BUỘC**
    - **Quận (district)**: ở thành phố, có Phường
    - **Huyện (district)**: ở tỉnh, có Xã hoặc Thị trấn
  - Level 3: Phường/Xã/Thị trấn
    - **Phường (ward)**: ở quận, trong thành phố
    - **Xã (commune)**: ở huyện, trong tỉnh
    - **Thị trấn (township)**: ở huyện, trong tỉnh

  **CẤU TRÚC MỚI (2 levels - đơn giản hóa):**
  - Level 1: Tỉnh/Thành phố (Province)
  - Level 3: Phường/Xã/Thị trấn - **TRỰC THUỘC TỈNH/TP** (không có Quận/Huyện)
    - **Phường (ward)**: trực thuộc thành phố
    - **Xã (commune)**: trực thuộc tỉnh
    - **Thị trấn (township)**: trực thuộc tỉnh
- Ở nước ngoài thường có 2 levels: State/Province (level 1) → City (level 2)
- Có thể mở rộng thêm levels tùy theo quốc gia

## Usage Examples

### Vietnam Address - Old Structure (3 levels)
```typescript
import { buildAddressString } from "@base/client/utils/address/addressUtils";

// Cấu trúc cũ: Tỉnh -> Quận/Huyện -> Phường/Xã
const vnAddressOld: Partial<Address> = {
  street: "123 Nguyễn Trãi",
  postalCode: "700000",
  country: { id: "VN", name: { vi: "Việt Nam", en: "Vietnam" } },
  administrativeUnits: [
    {
      id: "79",
      name: { vi: "TP. Hồ Chí Minh", en: "Ho Chi Minh City" },
      type: "province",
      level: 1
    },
    {
      id: "760",
      name: { vi: "Quận 1", en: "District 1" },
      type: "district",  // Quận (bắt buộc trong cấu trúc cũ)
      level: 2
    },
    {
      id: "26734",
      name: { vi: "Phường Bến Nghé", en: "Ben Nghe Ward" },
      type: "ward",  // Phường (in quận)
      level: 3
    }
  ]
};

const addressString = buildAddressString(vnAddressOld);
// Result: "123 Nguyễn Trãi, TP. Hồ Chí Minh, Quận 1, Phường Bến Nghé, 700000, Việt Nam"
```

### Vietnam Address - New Structure (2 levels)
```typescript
// Cấu trúc mới: Tỉnh/TP -> Phường/Xã (bỏ Quận/Huyện)
const vnAddressNew: Partial<Address> = {
  street: "456 Lê Lợi",
  postalCode: "700000",
  country: { id: "VN", name: { vi: "Việt Nam", en: "Vietnam" } },
  administrativeUnits: [
    {
      id: "79",
      name: { vi: "TP. Hồ Chí Minh", en: "Ho Chi Minh City" },
      type: "province",
      level: 1
    },
    // Không có district (Quận/Huyện) - cấu trúc mới
    {
      id: "26734",
      name: { vi: "Phường Bến Nghé", en: "Ben Nghe Ward" },
      type: "ward",  // Phường (trực thuộc TP, không có Quận)
      level: 3
    }
  ]
};

const addressString = buildAddressString(vnAddressNew);
// Result: "456 Lê Lợi, TP. Hồ Chí Minh, Phường Bến Nghé, 700000, Việt Nam"
```

### International Address (USA)
```typescript
const usAddress: Partial<Address> = {
  street: "1600 Pennsylvania Avenue NW",
  postalCode: "20500",
  country: { id: "US", name: { en: "United States" } },
  administrativeUnits: [
    {
      id: "DC",
      name: { en: "District of Columbia" },
      type: "state",
      level: 1
    },
    {
      id: "WAS",
      name: { en: "Washington" },
      type: "city",
      level: 2
    }
  ]
};

const addressString = buildAddressString(usAddress);
// Result: "1600 Pennsylvania Avenue NW, District of Columbia, Washington, 20500, United States"
```

### Using Helper Functions
```typescript
import { 
  getUnitByLevel, 
  getUnitByType, 
  hasUnitType,
  isOldVietnamStructure,
  getVietnamStructureType,
  validateVietnamAddress
} from "@base/client/utils/address/addressUtils";

// Get province (level 1)
const province = getUnitByLevel(address, 1);

// Get ward by type
const ward = getUnitByType(address, "ward");

// Check if address has a district
const hasDistrict = hasUnitType(address, "district");

// Check Vietnam address structure - CÁCH ĐƠN GIẢN NHẤT
const isOld = isOldVietnamStructure(address); 
// true = cấu trúc cũ (3 levels: có Quận/Huyện)
// false = cấu trúc mới (2 levels: không có Quận/Huyện)

// Hoặc dùng getVietnamStructureType() để có thêm thông tin
const structureType = getVietnamStructureType(address); 
// "old" = cấu trúc cũ (3 levels)
// "new" = cấu trúc mới (2 levels)
// undefined = không phải địa chỉ Việt Nam

// Validate Vietnam address
const isValid = validateVietnamAddress(address); // true if valid structure

// Example: Conditional rendering based on structure
if (structureType === "old") {
  // Hiển thị: Tỉnh -> Quận/Huyện -> Phường/Xã
  const district = getUnitByLevel(address, 2);
  console.log("Quận/Huyện:", district?.name.vi);
} else if (structureType === "new") {
  // Hiển thị: Tỉnh/TP -> Phường/Xã (không có Quận/Huyện)
  console.log("Cấu trúc mới - không có Quận/Huyện");
}
```
