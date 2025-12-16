import type {
  Address,
  AdministrativeUnit,
  AdministrativeUnitType,
} from "@base/client/interface/Address";

import { LocalizeText } from "@base/client/interface/LocalizeText";
import isEmpty from "lodash/isEmpty";

type LocalizeTextOrString = LocalizeText | string;
/**
 * Get localized name from LocalizeText
 */
const getLocalizedName = (
  name:
    | string
    | { vi?: string; en?: string; [key: string]: string | undefined },
): string => {
  if (typeof name === "string") {
    return name;
  }

  return name.vi || name.en || "";
};

/**
 * Build address string from Address object
 * Format: "Street, [Administrative Units sorted by level], PostalCode, Country"
 */
export const buildAddressString = (
  address: Partial<Address>,
  locale: string,
): string => {
  const buildObjectOrString = (
    value: LocalizeTextOrString | undefined,
  ): string => {
    if (typeof value === "string") {
      return value?.trim() || "";
    }
    if (typeof value === "object" && value !== null) {
      const localizeText = value as LocalizeText;
      const result = (localizeText[locale as keyof LocalizeText] ||
        localizeText.vi ||
        localizeText.en ||
        "") as string;

      return result?.trim() || "";
    }

    return "";
  };

  const street = buildObjectOrString(address.street);

  const administrativeUnits: string[] =
    address.administrativeUnits
      ?.sort((a, b) => a.level - b.level)
      .map((unit) => {
        return buildObjectOrString(unit.name);
      }) ?? [];

  const country = buildObjectOrString(address.country?.name);

  const fullAddress = [street, ...administrativeUnits, country]
    .filter((x) => !isEmpty(x as string))
    .join(", ");

  return fullAddress;
};

/**
 * Format address for display
 */
export const formatAddressDisplay = (
  address: Partial<Address>,
  locale: string,
): string => {
  return buildAddressString(address, locale);
};

/**
 * Get administrative unit by level
 */
export const getUnitByLevel = (
  address: Partial<Address>,
  level: number,
): AdministrativeUnit | undefined => {
  return address.administrativeUnits?.find((u) => u.level === level);
};

/**
 * Get administrative unit by type
 */
export const getUnitByType = (
  address: Partial<Address>,
  type: AdministrativeUnitType,
): AdministrativeUnit | undefined => {
  return address.administrativeUnits?.find((u) => u.type === type);
};

/**
 * Get all units of a specific type
 */
export const getUnitsByType = (
  address: Partial<Address>,
  type: AdministrativeUnitType,
): AdministrativeUnit[] => {
  return address.administrativeUnits?.filter((u) => u.type === type) || [];
};

/**
 * Get the highest level administrative unit (largest level number)
 */
export const getHighestLevelUnit = (
  address: Partial<Address>,
): AdministrativeUnit | undefined => {
  if (
    !address.administrativeUnits ||
    address.administrativeUnits.length === 0
  ) {
    return undefined;
  }

  return [...address.administrativeUnits].sort((a, b) => b.level - a.level)[0];
};

/**
 * Get the lowest level administrative unit (smallest level number > 0)
 */
export const getLowestLevelUnit = (
  address: Partial<Address>,
): AdministrativeUnit | undefined => {
  if (
    !address.administrativeUnits ||
    address.administrativeUnits.length === 0
  ) {
    return undefined;
  }

  return [...address.administrativeUnits]
    .filter((u) => u.level > 0)
    .sort((a, b) => a.level - b.level)[0];
};

/**
 * Check if address has a specific administrative unit type
 */
export const hasUnitType = (
  address: Partial<Address>,
  type: AdministrativeUnitType,
): boolean => {
  return address.administrativeUnits?.some((u) => u.type === type) || false;
};

/**
 * Check if Vietnam address uses old structure (3 levels) or new structure (2 levels)
 *
 * @param address - Address object to check
 * @returns true if old structure (has district), false if new structure (no district)
 *
 * @example
 * ```typescript
 * const isOld = isOldVietnamStructure(address);
 * if (isOld) {
 *   // Cấu trúc cũ: Tỉnh -> Quận/Huyện -> Phường/Xã
 * } else {
 *   // Cấu trúc mới: Tỉnh/TP -> Phường/Xã
 * }
 * ```
 */
export const isOldVietnamStructure = (address: Partial<Address>): boolean => {
  return hasUnitType(address, "district");
};

/**
 * Get the structure type for Vietnam address
 *
 * @param address - Address object to check
 * @returns "old" (3 levels), "new" (2 levels), or undefined if not Vietnam
 *
 * @example
 * ```typescript
 * const structureType = getVietnamStructureType(address);
 * switch (structureType) {
 *   case "old":
 *     // Cấu trúc cũ: có Quận/Huyện
 *     break;
 *   case "new":
 *     // Cấu trúc mới: không có Quận/Huyện
 *     break;
 *   case undefined:
 *     // Không phải địa chỉ Việt Nam
 *     break;
 * }
 * ```
 */
export const getVietnamStructureType = (
  address: Partial<Address>,
): "old" | "new" | undefined => {
  if (address.country?.id !== "VN") {
    return undefined;
  }

  return isOldVietnamStructure(address) ? "old" : "new";
};

/**
 * Validate Vietnam address structure
 * Returns true if valid, false if invalid
 * Valid structures:
 * - Old: [province (1), district (2), ward/commune/township (3)]
 * - New: [province (1), ward/commune/township (3)]
 */
export const validateVietnamAddress = (address: Partial<Address>): boolean => {
  if (address.country?.id !== "VN") {
    return true; // Not Vietnam, skip validation
  }

  if (
    !address.administrativeUnits ||
    address.administrativeUnits.length === 0
  ) {
    return false;
  }

  const hasProvince = hasUnitType(address, "province");
  const hasDistrict = hasUnitType(address, "district");
  const hasWard = hasUnitType(address, "ward");
  const hasCommune = hasUnitType(address, "commune");
  const hasTownship = hasUnitType(address, "township");
  const hasLevel3 = hasWard || hasCommune || hasTownship;

  // Must have province and at least one level 3 unit
  if (!hasProvince || !hasLevel3) {
    return false;
  }

  // If has district, must be old structure (3 levels)
  if (hasDistrict) {
    return hasLevel3; // Old structure: province + district + ward/commune/township
  }

  // If no district, must be new structure (2 levels)
  return hasLevel3; // New structure: province + ward/commune/township
};

/**
 * Create an administrative unit with automatic level assignment based on type
 * Type-safe: level is automatically set based on the type using discriminated union
 */
export const createAdministrativeUnit = (
  id: string,
  name: string | { vi?: string; en?: string },
  type: AdministrativeUnitType,
): AdministrativeUnit => {
  const nameObj: LocalizeText =
    typeof name === "string"
      ? { vi: name, en: name }
      : { vi: name.vi, en: name.en };

  // Type-safe creation based on discriminated union
  // Note: "country", "street", and "postal_code" are not allowed here as they're stored separately in Address
  switch (type) {
    case "province":
    case "state":
    case "region":
      return {
        id,
        name: nameObj,
        type: type as "province" | "state" | "region",
        level: 1,
      };
    case "district":
    case "city":
    case "county":
      return {
        id,
        name: nameObj,
        type: type as "district" | "city" | "county",
        level: 2,
      };
    case "ward":
    case "commune":
    case "neighborhood":
    case "township":
      return {
        id,
        name: nameObj,
        type: type as "ward" | "commune" | "neighborhood" | "township",
        level: 3,
      };
    default:
      // This should never happen, but TypeScript needs it for exhaustiveness
      const _exhaustive: never = type;

      throw new Error(`Unknown administrative unit type: ${_exhaustive}`);
  }
};
