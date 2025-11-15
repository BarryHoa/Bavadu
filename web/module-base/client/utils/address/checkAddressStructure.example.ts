/**
 * Examples: How to check if an address uses old or new structure in Vietnam
 */

import type { Address } from "@base/client/interface/Address";
import {
  isOldVietnamStructure,
  getVietnamStructureType,
  validateVietnamAddress,
  getUnitByLevel,
  hasUnitType,
} from "./addressUtils";

// Example 1: Old structure (3 levels) - có Quận/Huyện
const oldStructureAddress: Partial<Address> = {
  country: { id: "VN", name: { vi: "Việt Nam", en: "Vietnam" } },
  administrativeUnits: [
    { id: "79", name: { vi: "TP. Hồ Chí Minh" }, type: "province", level: 1 },
    { id: "760", name: { vi: "Quận 1" }, type: "district", level: 2 },
    { id: "26734", name: { vi: "Phường Bến Nghé" }, type: "ward", level: 3 },
  ],
};

// Example 2: New structure (2 levels) - không có Quận/Huyện
const newStructureAddress: Partial<Address> = {
  country: { id: "VN", name: { vi: "Việt Nam", en: "Vietnam" } },
  administrativeUnits: [
    { id: "79", name: { vi: "TP. Hồ Chí Minh" }, type: "province", level: 1 },
    { id: "26734", name: { vi: "Phường Bến Nghé" }, type: "ward", level: 3 },
    // Không có district (Quận/Huyện)
  ],
};

// ============================================
// CÁCH 1: Sử dụng isOldVietnamStructure()
// ============================================
console.log("=== Cách 1: isOldVietnamStructure() ===");

const isOld1 = isOldVietnamStructure(oldStructureAddress);
console.log("Old structure address:", isOld1); // true

const isOld2 = isOldVietnamStructure(newStructureAddress);
console.log("New structure address:", isOld2); // false

// ============================================
// CÁCH 2: Sử dụng getVietnamStructureType()
// ============================================
console.log("\n=== Cách 2: getVietnamStructureType() ===");

const type1 = getVietnamStructureType(oldStructureAddress);
console.log("Old structure address type:", type1); // "old"

const type2 = getVietnamStructureType(newStructureAddress);
console.log("New structure address type:", type2); // "new"

// Non-Vietnam address
const usAddress: Partial<Address> = {
  country: { id: "US", name: { en: "United States" } },
  administrativeUnits: [
    { id: "DC", name: { en: "District of Columbia" }, type: "state", level: 1 },
  ],
};
const type3 = getVietnamStructureType(usAddress);
console.log("US address type:", type3); // undefined

// ============================================
// CÁCH 3: Sử dụng validateVietnamAddress()
// ============================================
console.log("\n=== Cách 3: validateVietnamAddress() ===");

const isValid1 = validateVietnamAddress(oldStructureAddress);
console.log("Old structure is valid:", isValid1); // true

const isValid2 = validateVietnamAddress(newStructureAddress);
console.log("New structure is valid:", isValid2); // true

// Invalid address (missing province)
const invalidAddress: Partial<Address> = {
  country: { id: "VN", name: { vi: "Việt Nam" } },
  administrativeUnits: [
    { id: "26734", name: { vi: "Phường Bến Nghé" }, type: "ward", level: 3 },
    // Missing province
  ],
};
const isValid3 = validateVietnamAddress(invalidAddress);
console.log("Invalid address is valid:", isValid3); // false

// ============================================
// CÁCH 4: Manual check - Kiểm tra thủ công
// ============================================
console.log("\n=== Cách 4: Manual check ===");

function checkStructureManually(address: Partial<Address>): "old" | "new" | "invalid" | "not-vn" {
  // Check if Vietnam
  if (address.country?.id !== "VN") {
    return "not-vn";
  }

  // Check if has district (level 2)
  const hasDistrict = hasUnitType(address, "district");
  const hasProvince = hasUnitType(address, "province");
  const hasLevel3 = hasUnitType(address, "ward") || 
                    hasUnitType(address, "commune") || 
                    hasUnitType(address, "township");

  if (!hasProvince || !hasLevel3) {
    return "invalid";
  }

  return hasDistrict ? "old" : "new";
}

console.log("Old structure (manual):", checkStructureManually(oldStructureAddress)); // "old"
console.log("New structure (manual):", checkStructureManually(newStructureAddress)); // "new"

// ============================================
// CÁCH 5: Check bằng level
// ============================================
console.log("\n=== Cách 5: Check by level ===");

function checkStructureByLevel(address: Partial<Address>): "old" | "new" | "unknown" {
  if (address.country?.id !== "VN") {
    return "unknown";
  }

  const level2Unit = getUnitByLevel(address, 2);
  const level3Unit = getUnitByLevel(address, 3);

  if (!level3Unit) {
    return "unknown"; // Must have level 3
  }

  // If has level 2 (district), it's old structure
  // If no level 2, it's new structure
  return level2Unit ? "old" : "new";
}

console.log("Old structure (by level):", checkStructureByLevel(oldStructureAddress)); // "old"
console.log("New structure (by level):", checkStructureByLevel(newStructureAddress)); // "new"

// ============================================
// USAGE IN COMPONENT
// ============================================
console.log("\n=== Usage in React Component ===");

/**
 * Example React component usage:
 * 
 * ```tsx
 * import { getVietnamStructureType } from "@base/client/utils/address/addressUtils";
 * 
 * function AddressDisplay({ address }: { address: Address }) {
 *   const structureType = getVietnamStructureType(address);
 *   
 *   if (structureType === "old") {
 *     // Hiển thị: Tỉnh -> Quận/Huyện -> Phường/Xã
 *     const province = getUnitByLevel(address, 1);
 *     const district = getUnitByLevel(address, 2);
 *     const ward = getUnitByLevel(address, 3);
 *     return (
 *       <div>
 *         {province?.name.vi} → {district?.name.vi} → {ward?.name.vi}
 *       </div>
 *     );
 *   } else if (structureType === "new") {
 *     // Hiển thị: Tỉnh/TP -> Phường/Xã
 *     const province = getUnitByLevel(address, 1);
 *     const ward = getUnitByLevel(address, 3);
 *     return (
 *       <div>
 *         {province?.name.vi} → {ward?.name.vi}
 *       </div>
 *     );
 *   }
 *   
 *   return <div>Invalid address</div>;
 * }
 * ```
 */

